import express from 'express';
const router = express.Router();

import createError from 'http-errors';
import databaseConnectionPool from '../utils/databaseConnectionPool.mjs';
import queries from '../utils/queries.mjs';
import validationSchemas from '../utils/validationSchemas.mjs';

import authenticate from '../middlewares/authenticate.mjs';
import validateBody from '../middlewares/validateBody.mjs';
import validateIdMiddleware from '../middlewares/validateIdMiddleware.mjs';

/* Create grade */
router.post(
  '/',
  authenticate(['Nauczyciel']),
  validateBody(validationSchemas.createGrade),
  async function (req, res, next) {
    const { idUser } = req.user;
    const { idCourseHasStudent, idGradeType, value } = req.body;

    const courseHasStudent =
      (
        await databaseConnectionPool.queryNamedPlaceholders(
          queries.getCourseHasStudentByIdUser,
          {
            id_course_has_student: idCourseHasStudent,
            id_user: idUser,
          }
        )
      )[0] ?? null;

    if (!courseHasStudent) {
      return next(createError(400, 'Nieprawidłowa treść żądania'));
    }

    await databaseConnectionPool.queryNamedPlaceholders(queries.createGrade, {
      id_course_has_student: idCourseHasStudent,
      id_grade_type: idGradeType,
      value,
    });

    return res.sendStatus(204);
  }
);

/* Update grade */
router.put(
  '/:idGrade',
  authenticate(['Nauczyciel']),
  validateIdMiddleware('idGrade'),
  validateBody(validationSchemas.updateGrade),
  async function (req, res, next) {
    const { idUser } = req.user;
    let { idGrade } = req.params;
    idGrade = Number(idGrade);
    const { idGradeType, value } = req.body;

    const grade =
      (
        await databaseConnectionPool.queryNamedPlaceholders(
          queries.getGradeByIdUser,
          {
            id_grade: idGrade,
            id_user: idUser,
          }
        )
      )[0] ?? null;

    if (!grade) {
      return next(createError(400, 'Nieprawidłowa treść żądania'));
    }

    const result = await databaseConnectionPool.queryNamedPlaceholders(
      queries.updateGrade,
      {
        id_grade: idGrade,
        id_grade_type: idGradeType,
        value,
      }
    );

    if (result.affectedRows === 0) {
      return next(createError(400, 'Nieprawidłowa treść żądania'));
    }

    return res.sendStatus(204);
  }
);

/* Delete grade */
router.delete(
  '/:idGrade',
  authenticate(['Nauczyciel']),
  validateIdMiddleware('idGrade'),
  async function (req, res, next) {
    const { idUser } = req.user;
    let { idGrade } = req.params;
    idGrade = Number(idGrade);

    try {
      const grade =
        (
          await databaseConnectionPool.queryNamedPlaceholders(
            queries.getGradeByIdUser,
            {
              id_grade: idGrade,
              id_user: idUser,
            }
          )
        )[0] ?? null;

      if (!grade) {
        return next(createError(400, 'Nieprawidłowa treść żądania'));
      }

      const result = await databaseConnectionPool.queryNamedPlaceholders(
        queries.deleteGrade,
        {
          id_grade: idGrade,
        }
      );

      if (result.affectedRows === 0) {
        return next(createError(400, 'Nieprawidłowa treść żądania'));
      }
    } catch (err) {
      console.error(err);
      return next(createError(400, 'Nie udało się usunąć oceny'));
    }

    return res.sendStatus(204);
  }
);

export default router;
