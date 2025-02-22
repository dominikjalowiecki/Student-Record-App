import express from 'express';
const router = express.Router();

import createError from 'http-errors';
import databaseConnectionPool from '../utils/databaseConnectionPool.mjs';
import queries from '../utils/queries.mjs';
import validationSchemas from '../utils/validationSchemas.mjs';
import { formatDate, dayStringToDayNumber } from '../utils/index.mjs';

import authenticate from '../middlewares/authenticate.mjs';
import validateBody from '../middlewares/validateBody.mjs';
import validateIdMiddleware from '../middlewares/validateIdMiddleware.mjs';

/* Create presence */
router.post(
  '/',
  authenticate(['Nauczyciel']),
  validateBody(validationSchemas.createPresence),
  async function (req, res, next) {
    const { idUser } = req.user;
    const { idCourseHasStudent, present } = req.body;

    // const currentDate = new Date();

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

    // const courseDayNumber = dayStringToDayNumber(courseHasStudent.day);
    // if (currentDate.getDay() !== courseDayNumber) {
    //   return next(createError(400, 'Nieprawidłowa treść żądania'));
    // }

    // const courseStart = new Date(
    //   `${formatDate(currentDate)} ${courseHasStudent.start}`
    // );
    // const courseEnd = new Date(
    //   `${formatDate(currentDate)} ${courseHasStudent.end}`
    // );

    // if (currentDate < courseStart || currentDate > courseEnd) {
    //   return next(createError(400, 'Nieprawidłowa treść żądania'));
    // }

    await databaseConnectionPool.queryNamedPlaceholders(
      queries.createPresence,
      {
        id_course_has_student: idCourseHasStudent,
        present,
      }
    );

    return res.sendStatus(204);
  }
);

/* Update presence */
router.put(
  '/:idPresence',
  authenticate(['Nauczyciel']),
  validateIdMiddleware('idPresence'),
  validateBody(validationSchemas.updatePresence),
  async function (req, res, next) {
    const { idUser } = req.user;
    let { idPresence } = req.params;
    idPresence = Number(idPresence);
    const { present } = req.body;

    const presence =
      (
        await databaseConnectionPool.queryNamedPlaceholders(
          queries.getPresenceByIdUser,
          {
            id_presence: idPresence,
            id_user: idUser,
          }
        )
      )[0] ?? null;

    if (!presence) {
      return next(createError(400, 'Nieprawidłowa treść żądania'));
    }

    const result = await databaseConnectionPool.queryNamedPlaceholders(
      queries.updatePresence,
      {
        id_presence: idPresence,
        present,
      }
    );

    if (result.affectedRows === 0) {
      return next(createError(400, 'Nieprawidłowa treść żądania'));
    }

    return res.sendStatus(204);
  }
);

/* Delete presence */
router.delete(
  '/:idPresence',
  authenticate(['Nauczyciel']),
  validateIdMiddleware('idPresence'),
  async function (req, res, next) {
    const { idUser } = req.user;
    let { idPresence } = req.params;
    idPresence = Number(idPresence);

    try {
      const presence =
        (
          await databaseConnectionPool.queryNamedPlaceholders(
            queries.getPresenceByIdUser,
            {
              id_presence: idPresence,
              id_user: idUser,
            }
          )
        )[0] ?? null;

      if (!presence) {
        return next(createError(400, 'Nieprawidłowa treść żądania'));
      }

      const result = await databaseConnectionPool.queryNamedPlaceholders(
        queries.deletePresence,
        {
          id_presence: idPresence,
        }
      );

      if (result.affectedRows === 0) {
        return next(createError(400, 'Nieprawidłowa treść żądania'));
      }
    } catch (err) {
      console.error(err);
      return next(createError(400, 'Nie udało się usunąć obecności'));
    }

    return res.sendStatus(204);
  }
);

export default router;
