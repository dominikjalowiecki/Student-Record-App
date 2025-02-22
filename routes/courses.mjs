import express from 'express';
const router = express.Router();

import createError from 'http-errors';
import databaseConnectionPool from '../utils/databaseConnectionPool.mjs';
import queries from '../utils/queries.mjs';
import validationSchemas from '../utils/validationSchemas.mjs';

import authenticate from '../middlewares/authenticate.mjs';
import validateBody from '../middlewares/validateBody.mjs';
import validateIdMiddleware from '../middlewares/validateIdMiddleware.mjs';

/* Get course */
router.get(
  '/:idCourse',
  authenticate(['Nauczyciel']),
  validateIdMiddleware('idCourse'),
  async function (req, res, next) {
    const { idUser } = req.user;
    let { idCourse } = req.params;
    idCourse = Number(idCourse);

    const course =
      (
        await databaseConnectionPool.queryNamedPlaceholders(
          queries.getCourseByIdUser,
          {
            id_course: idCourse,
            id_user: idUser,
          }
        )
      )[0] ?? null;

    if (!course) {
      return next(createError(404, 'Nie znaleziono żądanego zasobu'));
    }

    const students = await databaseConnectionPool.queryNamedPlaceholders(
      queries.getCourseHasStudents,
      {
        id_course: idCourse,
      }
    );

    course.students = students;

    return res.json(course);
  }
);

/* Get course student details */
router.get(
  '/:idCourse/students/:idStudent',
  authenticate(['Nauczyciel']),
  validateIdMiddleware('idStudent'),
  async function (req, res, next) {
    const { idUser } = req.user;
    let { idCourse, idStudent } = req.params;
    idCourse = Number(idCourse);
    idStudent = Number(idStudent);

    const student =
      (
        await databaseConnectionPool.queryNamedPlaceholders(
          queries.getStudentByIdCourseAndIdUser,
          {
            id_student: idStudent,
            id_course: idCourse,
            id_user: idUser,
          }
        )
      )[0] ?? null;

    if (!student) {
      return next(createError(404, 'Nie znaleziono żądanego zasobu'));
    }

    const presences = await databaseConnectionPool.queryNamedPlaceholders(
      queries.getStudentCoursePresences,
      {
        id_course: idCourse,
        id_student: idStudent,
      }
    );
    const grades = await databaseConnectionPool.queryNamedPlaceholders(
      queries.getStudentCourseGrades,
      {
        id_course: idCourse,
        id_student: idStudent,
      }
    );

    student.presences = presences;
    student.grades = grades;

    return res.json(student);
  }
);

/* Create course */
router.post(
  '/',
  authenticate(['Nauczyciel']),
  validateBody(validationSchemas.createCourse),
  async function (req, res, next) {
    const { idUser } = req.user;
    const { idUserHasSubject, name, day, start, end, students } = req.body;

    if (!(start.localeCompare(end) < 0)) {
      return next(
        createError(400, 'Rozpoczęcie musi być wcześniej niż zakończenie')
      );
    }

    const userHasSubject =
      (
        await databaseConnectionPool.queryNamedPlaceholders(
          queries.getUserHasSubjectByIdUser,
          {
            id_user_has_subject: idUserHasSubject,
            id_user: idUser,
          }
        )
      )[0] ?? null;

    if (!userHasSubject) {
      return next(createError(400, 'Nieprawidłowa treść żądania'));
    }

    const course =
      (
        await databaseConnectionPool.queryNamedPlaceholders(
          queries.getCourseByName,
          {
            name,
            id_course: null,
          }
        )
      )[0] ?? null;

    if (course) {
      return next(createError(400, 'Podany kurs już istnieje'));
    }

    const result = await databaseConnectionPool.queryNamedPlaceholders(
      queries.createCourse,
      {
        id_user_has_subject: idUserHasSubject,
        name,
        day,
        start: start.substring(0, 5),
        end: end.substring(0, 5),
      }
    );

    const idCourse = Number(result.insertId);

    for (const idStudent of students) {
      try {
        await databaseConnectionPool.queryNamedPlaceholders(
          queries.createCourseHasStudent,
          {
            id_course: idCourse,
            id_student: idStudent,
          }
        );
      } catch (err) {}
    }

    return res.sendStatus(204);
  }
);

/* Update course */
router.put(
  '/:idCourse',
  authenticate(['Nauczyciel']),
  validateIdMiddleware('idCourse'),
  validateBody(validationSchemas.updateCourse),
  async function (req, res, next) {
    const { idUser } = req.user;
    let { idCourse } = req.params;
    idCourse = Number(idCourse);
    const { name, day, start, end, students } = req.body;

    if (!(start.localeCompare(end) < 0)) {
      return next(
        createError(400, 'Rozpoczęcie musi być wcześniej niż zakończenie')
      );
    }

    const course =
      (
        await databaseConnectionPool.queryNamedPlaceholders(
          queries.getCourseByIdUser,
          {
            id_course: idCourse,
            id_user: idUser,
          }
        )
      )[0] ?? null;

    if (!course) {
      return next(createError(400, 'Nieprawidłowa treść żądania'));
    }

    const foundCourse =
      (
        await databaseConnectionPool.queryNamedPlaceholders(
          queries.getCourseByName,
          {
            name,
            id_course: idCourse,
          }
        )
      )[0] ?? null;

    if (foundCourse) {
      return next(createError(400, 'Podany kurs już istnieje'));
    }

    const result = await databaseConnectionPool.queryNamedPlaceholders(
      queries.updateCourse,
      {
        id_course: idCourse,
        name,
        day,
        start: start.substring(0, 5),
        end: end.substring(0, 5),
      }
    );

    if (result.affectedRows === 0) {
      return next(createError(400, 'Nieprawidłowa treść żądania'));
    }

    await databaseConnectionPool.queryNamedPlaceholders(
      queries.deleteCourseHasStudents,
      {
        id_course: idCourse,
      }
    );

    for (const idStudent of students) {
      try {
        await databaseConnectionPool.queryNamedPlaceholders(
          queries.createCourseHasStudent,
          {
            id_course: idCourse,
            id_student: idStudent,
          }
        );
      } catch (err) {}
    }

    return res.sendStatus(204);
  }
);

/* Delete course */
router.delete(
  '/:idCourse',
  authenticate(['Nauczyciel']),
  validateIdMiddleware('idCourse'),
  async function (req, res, next) {
    const { idUser } = req.user;
    let { idCourse } = req.params;
    idCourse = Number(idCourse);

    try {
      const course =
        (
          await databaseConnectionPool.queryNamedPlaceholders(
            queries.getCourseByIdUser,
            {
              id_course: idCourse,
              id_user: idUser,
            }
          )
        )[0] ?? null;

      if (!course) {
        return next(createError(400, 'Nieprawidłowa treść żądania'));
      }

      await databaseConnectionPool.queryNamedPlaceholders(
        queries.deleteCourseHasStudents,
        {
          id_course: idCourse,
        }
      );

      const result = await databaseConnectionPool.queryNamedPlaceholders(
        queries.deleteCourse,
        {
          id_course: idCourse,
        }
      );

      if (result.affectedRows === 0) {
        return next(createError(400, 'Nieprawidłowa treść żądania'));
      }
    } catch (err) {
      console.error(err);
      return next(createError(400, 'Nie udało się usunąć kursu'));
    }

    return res.sendStatus(204);
  }
);

export default router;
