const queries = {
  getUsersCount: `
        SELECT
            COUNT(id_user) 'count'
        FROM
            user
        WHERE
            (
                :search IS NULL OR (
                    name LIKE :search
                ) OR (
                    surname LIKE :search
                ) OR (
                    login LIKE :search
                )
            );
    `,
  getUsersPagination: `
        SELECT
            id_user, name, surname, login, role, created
        FROM
            user
        WHERE
            (
                :search IS NULL OR (
                    name LIKE :search
                ) OR (
                    surname LIKE :search
                ) OR (
                    login LIKE :search
                )
            )
        ORDER BY
            surname ASC
        LIMIT
            :pagination
        OFFSET
            :pagination_start;
    `,
  getUserByLogin: `
        SELECT
            id_user, name, surname, login, password, role, created
        FROM
            user
        WHERE
            login = :login AND
            (:id_user IS NULL OR id_user != :id_user);
    `,
  getUser: `
        SELECT
            id_user, name, surname, login, role, created
        FROM
            user
        WHERE
            id_user = :id_user;
  `,
  createUser: `
        INSERT INTO
            user (name, surname, login, password, role)
        VALUES
            (:name, :surname, :login, :password, :role);
    `,
  updateUser: `
        UPDATE
            user
        SET
            name = :name,
            surname = :surname,
            login = :login,
            role = :role
        WHERE
            id_user = :id_user;
    `,
  updateUserPassword: `
        UPDATE
            user
        SET
            password = :password
        WHERE
            id_user = :id_user;
    `,
  deleteUser: `
        DELETE FROM
            user
        WHERE
            id_user = :id_user;
    `,
  getSubjects: `
        SELECT
            id_subject, name
        FROM
            subject
        ORDER BY
            name ASC;
    `,
  getSubjectByName: `
        SELECT
            id_subject
        FROM
            subject
        WHERE
            name = :name;
    `,
  getUsersSubjects: `
        SELECT
            id_subject, s.name, uhs.id_user_has_subject, uhs.id_user
        FROM
            subject s
        JOIN
            user_has_subject uhs USING(id_subject)
        WHERE
            uhs.id_user IN(:ids_users)
        ORDER BY
            s.name ASC;
    `,
  getUserSubjects: `
        SELECT
            id_subject, s.name, uhs.id_user_has_subject
        FROM
            subject s
        JOIN
            user_has_subject uhs USING(id_subject)
        WHERE
            uhs.id_user = :id_user
        ORDER BY
            s.name ASC;
    `,
  createSubject: `
        INSERT INTO
            subject (name)
        VALUES
            (:name);
    `,
  deleteSubject: `
        DELETE FROM
            subject
        WHERE
            id_subject = :id_subject;
    `,
  getUserHasSubjectByIdUser: `
        SELECT
            id_user_has_subject
        FROM
            user_has_subject
        WHERE
            id_user_has_subject = :id_user_has_subject AND
            id_user = :id_user;
    `,
  createUserHasSubject: `
        INSERT INTO
            user_has_subject (id_user, id_subject)
        VALUES
            (:id_user, :id_subject);
    `,
  deleteUserHasSubjects: `
        DELETE FROM
            user_has_subject
        WHERE
            id_user = :id_user;
    `,
  getUserCourses: `
        SELECT
            c.id_course, c.name, c.day, c.start, c.end, c.created, c.updated, id_subject, s.name 'subject_name'
        FROM
            course c
        JOIN
            user_has_subject uhs USING(id_user_has_subject)
        JOIN
            subject s USING(id_subject)
        WHERE
            uhs.id_user = :id_user
        ORDER BY
            c.name ASC;
    `,
  getCourseByIdUser: `
        SELECT
            c.id_course, c.id_user_has_subject, c.name, c.day, c.start, c.end, c.created, c.updated, id_subject, s.name 'subject_name'
        FROM
            course c
        JOIN
            user_has_subject uhs USING(id_user_has_subject)
        JOIN
            subject s USING(id_subject)
        WHERE
            c.id_course = :id_course AND
            uhs.id_user = :id_user;
    `,
  getCourseByName: `
        SELECT
            id_course
        FROM
            course
        WHERE
            name = :name AND
            (:id_course IS NULL OR id_course != :id_course);
    `,
  createCourse: `
        INSERT INTO
            course (id_user_has_subject, name, day, start, end)
        VALUES
            (:id_user_has_subject, :name, :day, :start, :end);
    `,
  updateCourse: `
        UPDATE
            course
        SET
            name = :name,
            day = :day,
            start = :start,
            end = :end
        WHERE
            id_course = :id_course;
    `,
  deleteCourse: `
        DELETE FROM
            course
        WHERE
            id_course = :id_course;
    `,
  getStudentsCount: `
        SELECT
            COUNT(id_student) 'count'
        FROM
            student
        WHERE
            (
                :search IS NULL OR (
                    name LIKE :search
                ) OR (
                    surname LIKE :search
                )
            );
    `,
  getStudentsPagination: `
        SELECT
            id_student, name, surname, created
        FROM
            student
        WHERE
            (
                :search IS NULL OR (
                    name LIKE :search
                ) OR (
                    surname LIKE :search
                )
            )
        ORDER BY
            surname ASC
        LIMIT
            :pagination
        OFFSET
            :pagination_start;
    `,
  getStudentByIdCourseAndIdUser: `
        SELECT
            id_student, s.name, s.surname, s.created, chs.id_course_has_student
        FROM
            student s
        JOIN
            course_has_student chs USING(id_student)
        JOIN
            course c USING(id_course)
        JOIN
            user_has_subject uhs USING(id_user_has_subject)
        WHERE
            id_student = :id_student AND
            chs.id_course = :id_course AND
            uhs.id_user = :id_user;
    `,
  createStudent: `
        INSERT INTO
            student (name, surname)
        VALUES
            (:name, :surname);
    `,
  deleteStudent: `
        DELETE FROM
            student
        WHERE
            id_student = :id_student;
    `,
  getCourseHasStudents: `
        SELECT
            id_student, s.name, s.surname, s.created, chs.id_course_has_student
        FROM
            student s
        JOIN
            course_has_student chs USING(id_student)
        WHERE
            chs.id_course = :id_course
        ORDER BY
            s.surname ASC;
    `,
  getCourseHasStudentByIdUser: `
        SELECT
            chs.id_course_has_student, id_course, c.day, c.start, c.end
        FROM
            course_has_student chs
        JOIN
            course c USING(id_course)
        JOIN
            user_has_subject uhs USING(id_user_has_subject)
        WHERE
            chs.id_course_has_student = :id_course_has_student AND
            uhs.id_user = :id_user;
    `,
  createCourseHasStudent: `
        INSERT INTO
            course_has_student (id_course, id_student)
        VALUES
            (:id_course, :id_student);
    `,
  deleteCourseHasStudents: `
        DELETE FROM
            course_has_student
        WHERE
            id_course = :id_course;
    `,
  getStudentCoursePresences: `
        SELECT
            p.id_presence, p.present, p.created, p.updated
        FROM
            presence p
        JOIN
            course_has_student chs USING(id_course_has_student)
        WHERE
            chs.id_course = :id_course AND
            chs.id_student = :id_student
        ORDER BY
            p.created ASC;
    `,
  getPresenceByIdUser: `
        SELECT
            p.id_presence
        FROM
            presence p
        JOIN
            course_has_student chs USING(id_course_has_student)
        JOIN
            course c USING(id_course)
        JOIN
            user_has_subject uhs USING(id_user_has_subject)
        WHERE
            p.id_presence = :id_presence AND
            uhs.id_user = :id_user;
    `,
  createPresence: `
        INSERT INTO
            presence (id_course_has_student, present)
        VALUES
            (:id_course_has_student, :present);
    `,
  updatePresence: `
        UPDATE
            presence
        SET
            present = :present
        WHERE
            id_presence = :id_presence;
    `,
  deletePresence: `
        DELETE FROM
            presence
        WHERE
            id_presence = :id_presence;
    `,
  getStudentCourseGrades: `
        SELECT
            g.id_grade, g.value, g.created, g.updated, id_grade_type, gt.name 'grade_type_name', gt.weightage 'grade_type_weightage', gt.presence_cancel 'grade_type_presence_cancel'
        FROM
            grade g
        JOIN
            course_has_student chs USING(id_course_has_student)
        JOIN
            grade_type gt USING(id_grade_type)
        WHERE
            chs.id_course = :id_course AND
            chs.id_student = :id_student
        ORDER BY
            g.created ASC;
    `,
  getGradeByIdUser: `
        SELECT
            g.id_grade
        FROM
            grade g
        JOIN
            course_has_student chs USING(id_course_has_student)
        JOIN
            course c USING(id_course)
        JOIN
            user_has_subject uhs USING(id_user_has_subject)
        WHERE
            g.id_grade = :id_grade AND
            uhs.id_user = :id_user;
    `,
  createGrade: `
        INSERT INTO
            grade (id_grade_type, id_course_has_student, value)
        VALUES
            (:id_grade_type, :id_course_has_student, :value);
    `,
  updateGrade: `
        UPDATE
            grade
        SET
            id_grade_type = :id_grade_type,
            value = :value
        WHERE
            id_grade = :id_grade;
    `,
  deleteGrade: `
        DELETE FROM
            grade
        WHERE
            id_grade = :id_grade;
    `,
  getGradeTypes: `
        SELECT
            id_grade_type, name, weightage, presence_cancel
        FROM
            grade_type
        ORDER BY
            name ASC;
    `,
  getGradeTypeByName: `
        SELECT
            id_grade_type
        FROM
            grade_type
        WHERE
            name = :name;
    `,
  createGradeType: `
        INSERT INTO
            grade_type (name, weightage, presence_cancel)
        VALUES
            (:name, :weightage, :presence_cancel);
    `,
  deleteGradeType: `
        DELETE FROM
            grade_type
        WHERE
            id_grade_type = :id_grade_type;
    `,
};

export default queries;
