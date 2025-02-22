import express from 'express';
const router = express.Router();

import createError from 'http-errors';
import config from '../config.mjs';
import databaseConnectionPool from '../utils/databaseConnectionPool.mjs';
import queries from '../utils/queries.mjs';
import validationSchemas from '../utils/validationSchemas.mjs';
import { validatePage } from '../utils/index.mjs';

import authenticate from '../middlewares/authenticate.mjs';
import validateBody from '../middlewares/validateBody.mjs';
import validateIdMiddleware from '../middlewares/validateIdMiddleware.mjs';

/* Get students */
router.get('/', authenticate(['Nauczyciel']), async function (req, res) {
  const { search } = req.query;
  let { page: currentPage } = req.query;
  currentPage = Number(currentPage);

  currentPage = validatePage(currentPage) ? currentPage : 1;

  const binding = {
    search: search ? `%${search}%` : null,
  };

  const count = (
    await databaseConnectionPool.queryNamedPlaceholders(
      queries.getStudentsCount,
      binding
    )
  )[0].count;

  const { pagination } = config;
  const pages = Math.ceil(count / pagination);

  if (pages === 0) {
    return res.json({
      pages,
      currentPage: 1,
      count,
      rows: [],
    });
  }

  if (currentPage > pages) {
    currentPage = 1;
  }

  const paginationStart = pagination * currentPage - pagination;

  const students = await databaseConnectionPool.queryNamedPlaceholders(
    queries.getStudentsPagination,
    { ...binding, pagination, pagination_start: paginationStart }
  );

  return res.json({
    pages,
    currentPage,
    count,
    rows: students,
  });
});

/* Create student */
router.post(
  '/',
  authenticate(['Nauczyciel']),
  validateBody(validationSchemas.createStudent),
  async function (req, res) {
    const { name, surname } = req.body;

    await databaseConnectionPool.queryNamedPlaceholders(queries.createStudent, {
      name,
      surname,
    });

    return res.sendStatus(204);
  }
);

/* Delete student */
router.delete(
  '/:idStudent',
  authenticate(['Nauczyciel']),
  validateIdMiddleware('idStudent'),
  async function (req, res, next) {
    let { idStudent } = req.params;
    idStudent = Number(idStudent);

    try {
      const result = await databaseConnectionPool.queryNamedPlaceholders(
        queries.deleteStudent,
        {
          id_student: idStudent,
        }
      );

      if (result.affectedRows === 0) {
        return next(createError(400, 'Nieprawidłowa treść żądania'));
      }
    } catch (err) {
      console.error(err);
      return next(createError(400, 'Nie udało się usunąć ucznia'));
    }

    return res.sendStatus(204);
  }
);

export default router;
