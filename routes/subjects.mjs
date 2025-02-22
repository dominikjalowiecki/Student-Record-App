import express from 'express';
const router = express.Router();

import createError from 'http-errors';
import databaseConnectionPool from '../utils/databaseConnectionPool.mjs';
import queries from '../utils/queries.mjs';
import validationSchemas from '../utils/validationSchemas.mjs';

import authenticate from '../middlewares/authenticate.mjs';
import validateBody from '../middlewares/validateBody.mjs';
import validateIdMiddleware from '../middlewares/validateIdMiddleware.mjs';

/* Get subjects */
router.get('/', authenticate(['Administrator']), async function (req, res) {
  const subjects = await databaseConnectionPool.queryNamedPlaceholders(
    queries.getSubjects
  );

  return res.json(subjects);
});

/* Create subject */
router.post(
  '/',
  authenticate(['Administrator']),
  validateBody(validationSchemas.createSubject),
  async function (req, res, next) {
    const { name } = req.body;

    const subject =
      (
        await databaseConnectionPool.queryNamedPlaceholders(
          queries.getSubjectByName,
          {
            name,
          }
        )
      )[0] ?? null;

    if (subject) {
      return next(createError(400, 'Podany przedmiot już istnieje'));
    }

    await databaseConnectionPool.queryNamedPlaceholders(queries.createSubject, {
      name,
    });

    return res.sendStatus(204);
  }
);

/* Delete subject */
router.delete(
  '/:idSubject',
  authenticate(['Administrator']),
  validateIdMiddleware('idSubject'),
  async function (req, res, next) {
    let { idSubject } = req.params;
    idSubject = Number(idSubject);

    try {
      const result = await databaseConnectionPool.queryNamedPlaceholders(
        queries.deleteSubject,
        {
          id_subject: idSubject,
        }
      );

      if (result.affectedRows === 0) {
        return next(createError(400, 'Nieprawidłowa treść żądania'));
      }
    } catch (err) {
      console.error(err);
      return next(createError(400, 'Nie udało się usunąć przedmiotu'));
    }

    return res.sendStatus(204);
  }
);

export default router;
