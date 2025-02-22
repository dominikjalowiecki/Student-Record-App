import express from 'express';
const router = express.Router();

import createError from 'http-errors';
import databaseConnectionPool from '../utils/databaseConnectionPool.mjs';
import queries from '../utils/queries.mjs';
import validationSchemas from '../utils/validationSchemas.mjs';

import authenticate from '../middlewares/authenticate.mjs';
import validateBody from '../middlewares/validateBody.mjs';
import validateIdMiddleware from '../middlewares/validateIdMiddleware.mjs';

/* Get grade types */
router.get('/', authenticate(), async function (req, res) {
  const gradeTypes = await databaseConnectionPool.queryNamedPlaceholders(
    queries.getGradeTypes
  );

  return res.json(gradeTypes);
});

/* Create grade type */
router.post(
  '/',
  authenticate(['Administrator']),
  validateBody(validationSchemas.createGradeType),
  async function (req, res, next) {
    const { name, weightage, presenceCancel } = req.body;

    const gradeType =
      (
        await databaseConnectionPool.queryNamedPlaceholders(
          queries.getGradeTypeByName,
          {
            name,
          }
        )
      )[0] ?? null;

    if (gradeType) {
      return next(createError(400, 'Podany typ oceny już istnieje'));
    }

    await databaseConnectionPool.queryNamedPlaceholders(
      queries.createGradeType,
      {
        name,
        weightage,
        presence_cancel: presenceCancel,
      }
    );

    return res.sendStatus(204);
  }
);

/* Delete grade type */
router.delete(
  '/:idGradeType',
  authenticate(['Administrator']),
  validateIdMiddleware('idGradeType'),
  async function (req, res, next) {
    let { idGradeType } = req.params;
    idGradeType = Number(idGradeType);

    try {
      const result = await databaseConnectionPool.queryNamedPlaceholders(
        queries.deleteGradeType,
        {
          id_grade_type: idGradeType,
        }
      );

      if (result.affectedRows === 0) {
        return next(createError(400, 'Nieprawidłowa treść żądania'));
      }
    } catch (err) {
      console.error(err);
      return next(createError(400, 'Nie udało się usunąć typu oceny'));
    }

    return res.sendStatus(204);
  }
);

export default router;
