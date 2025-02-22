import express from 'express';
const router = express.Router();

import createError from 'http-errors';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import config from '../config.mjs';
import databaseConnectionPool from '../utils/databaseConnectionPool.mjs';
import queries from '../utils/queries.mjs';
import TokenType from '../utils/tokenTypeEnum.mjs';
import validationSchemas from '../utils/validationSchemas.mjs';
import { validatePage } from '../utils/index.mjs';

import authenticate from '../middlewares/authenticate.mjs';
import validateBody from '../middlewares/validateBody.mjs';
import validateIdMiddleware from '../middlewares/validateIdMiddleware.mjs';

/* Sign-in user */
router.post(
  '/sign-in',
  validateBody(validationSchemas.signIn),
  async function (req, res, next) {
    const { login, password } = req.body;

    const user =
      (
        await databaseConnectionPool.queryNamedPlaceholders(
          queries.getUserByLogin,
          {
            login,
            id_user: null,
          }
        )
      )[0] ?? null;

    if (!user) {
      return next(createError(400, 'Nieprawidłowe dane logowania'));
    }

    let passwordValid = false;

    try {
      passwordValid = await argon2.verify(user.password, password);
    } catch (err) {}

    if (!passwordValid) {
      return next(createError(400, 'Nieprawidłowe dane logowania'));
    }

    const token = jwt.sign(
      {
        user: {
          idUser: user.id_user,
          role: user.role,
        },
        tokenType: TokenType.AUTHENTICATION,
      },
      config.jwt.secret
    );

    return res.json({ token });
  }
);

/* Get currently signed-in user */
router.get('/me', authenticate(), async function (req, res, next) {
  const { idUser, role } = req.user;

  const user =
    (
      await databaseConnectionPool.queryNamedPlaceholders(queries.getUser, {
        id_user: idUser,
      })
    )[0] ?? null;

  if (!user) {
    return next(createError(400, 'Konto nie istnieje'));
  }

  const subjects = await databaseConnectionPool.queryNamedPlaceholders(
    queries.getUserSubjects,
    {
      id_user: idUser,
    }
  );

  user.role = role;
  user.subjects = subjects;

  return res.json(user);
});

/* Get currently signed-in user courses */
router.get(
  '/me/courses',
  authenticate(['Nauczyciel']),
  async function (req, res) {
    const { idUser } = req.user;

    const courses = await databaseConnectionPool.queryNamedPlaceholders(
      queries.getUserCourses,
      {
        id_user: idUser,
      }
    );

    return res.json(courses);
  }
);

/* Get users */
router.get('/', authenticate(['Administrator']), async function (req, res) {
  const { search } = req.query;
  let { page: currentPage } = req.query;
  currentPage = Number(currentPage);

  currentPage = validatePage(currentPage) ? currentPage : 1;

  const binding = {
    search: search ? `%${search}%` : null,
  };

  const count = (
    await databaseConnectionPool.queryNamedPlaceholders(
      queries.getUsersCount,
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

  const users = await databaseConnectionPool.queryNamedPlaceholders(
    queries.getUsersPagination,
    { ...binding, pagination, pagination_start: paginationStart }
  );

  const idsUsers = users.map((user) => user.id_user);

  const subjects = await databaseConnectionPool.queryNamedPlaceholders(
    queries.getUsersSubjects,
    {
      ids_users: idsUsers,
    }
  );

  for (const user of users) {
    user.subjects = subjects.filter(
      (subject) => subject.id_user === user.id_user
    );
  }

  return res.json({
    pages,
    currentPage,
    count,
    rows: users,
  });
});

/* Create user */
router.post(
  '/',
  authenticate(['Administrator']),
  validateBody(validationSchemas.createUser),
  async function (req, res, next) {
    const { name, surname, login, password, role, subjects } = req.body;

    const user =
      (
        await databaseConnectionPool.queryNamedPlaceholders(
          queries.getUserByLogin,
          {
            login,
            id_user: null,
          }
        )
      )[0] ?? null;

    if (user) {
      return next(createError(400, 'Podany login został już wykorzystany'));
    }

    const hash = await argon2.hash(password);

    const result = await databaseConnectionPool.queryNamedPlaceholders(
      queries.createUser,
      {
        name,
        surname,
        login,
        password: hash,
        role,
      }
    );

    const idUser = Number(result.insertId);

    for (const idSubject of subjects) {
      try {
        await databaseConnectionPool.queryNamedPlaceholders(
          queries.createUserHasSubject,
          {
            id_user: idUser,
            id_subject: idSubject,
          }
        );
      } catch (err) {}
    }

    return res.sendStatus(204);
  }
);

/* Update user */
router.put(
  '/:idUser',
  authenticate(['Administrator']),
  validateIdMiddleware('idUser'),
  validateBody(validationSchemas.updateUser),
  async function (req, res, next) {
    let { idUser } = req.params;
    idUser = Number(idUser);
    const { name, surname, login, password, role, subjects } = req.body;

    const user =
      (
        await databaseConnectionPool.queryNamedPlaceholders(
          queries.getUserByLogin,
          {
            login,
            id_user: idUser,
          }
        )
      )[0] ?? null;

    if (user) {
      return next(createError(400, 'Podany login został już wykorzystany'));
    }

    const result = await databaseConnectionPool.queryNamedPlaceholders(
      queries.updateUser,
      {
        id_user: idUser,
        name,
        surname,
        login,
        role,
      }
    );

    if (result.affectedRows === 0) {
      return next(createError(400, 'Nieprawidłowa treść żądania'));
    }

    if (password) {
      const hash = await argon2.hash(password);

      await databaseConnectionPool.queryNamedPlaceholders(
        queries.updateUserPassword,
        {
          id_user: idUser,
          password: hash,
        }
      );
    }

    await databaseConnectionPool.queryNamedPlaceholders(
      queries.deleteUserHasSubjects,
      {
        id_user: idUser,
      }
    );

    for (const idSubject of subjects) {
      try {
        await databaseConnectionPool.queryNamedPlaceholders(
          queries.createUserHasSubject,
          {
            id_user: idUser,
            id_subject: idSubject,
          }
        );
      } catch (err) {}
    }

    return res.sendStatus(204);
  }
);

/* Delete user */
router.delete(
  '/:idUser',
  authenticate(['Administrator']),
  validateIdMiddleware('idUser'),
  async function (req, res, next) {
    let { idUser } = req.params;
    idUser = Number(idUser);

    try {
      await databaseConnectionPool.queryNamedPlaceholders(
        queries.deleteUserHasSubjects,
        {
          id_user: idUser,
        }
      );

      const result = await databaseConnectionPool.queryNamedPlaceholders(
        queries.deleteUser,
        {
          id_user: idUser,
        }
      );

      if (result.affectedRows === 0) {
        return next(createError(400, 'Nieprawidłowa treść żądania'));
      }
    } catch (err) {
      console.error(err);
      return next(createError(400, 'Nie udało się usunąć użytkownika'));
    }

    return res.sendStatus(204);
  }
);

export default router;
