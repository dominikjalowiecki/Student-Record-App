import { idValidationSchema, nameValidationSchema } from './index.mjs';

const validationSchemas = {
  signIn: {
    type: 'object',
    properties: {
      login: nameValidationSchema,
      password: {
        type: 'string',
      },
    },
    required: ['login', 'password'],
    additionalProperties: false,
  },
  createUser: {
    type: 'object',
    properties: {
      name: nameValidationSchema,
      surname: nameValidationSchema,
      login: nameValidationSchema,
      password: {
        type: 'string',
        minLength: 8,
      },
      role: {
        enum: ['Nauczyciel', 'Administrator'],
      },
      subjects: {
        type: 'array',
        items: idValidationSchema,
      },
    },
    required: ['name', 'surname', 'login', 'password', 'role', 'subjects'],
    additionalProperties: false,
  },
  updateUser: {
    type: 'object',
    properties: {
      name: nameValidationSchema,
      surname: nameValidationSchema,
      login: nameValidationSchema,
      password: {
        type: 'string',
        minLength: 8,
      },
      role: {
        enum: ['Nauczyciel', 'Administrator'],
      },
      subjects: {
        type: 'array',
        items: idValidationSchema,
      },
    },
    required: ['name', 'surname', 'login', 'role', 'subjects'],
    additionalProperties: false,
  },
  createSubject: {
    type: 'object',
    properties: {
      name: nameValidationSchema,
    },
    required: ['name'],
    additionalProperties: false,
  },
  createStudent: {
    type: 'object',
    properties: {
      name: nameValidationSchema,
      surname: nameValidationSchema,
    },
    required: ['name', 'surname'],
    additionalProperties: false,
  },
  createGradeType: {
    type: 'object',
    properties: {
      name: nameValidationSchema,
      weightage: {
        type: 'number',
        minimum: 0,
      },
      presenceCancel: {
        type: 'boolean',
      },
    },
    required: ['name', 'weightage', 'presenceCancel'],
    additionalProperties: false,
  },
  createCourse: {
    type: 'object',
    properties: {
      idUserHasSubject: idValidationSchema,
      name: nameValidationSchema,
      day: {
        enum: [
          'Poniedziałek',
          'Wtorek',
          'Środa',
          'Czwartek',
          'Piątek',
          'Sobota',
          'Niedziela',
        ],
      },
      start: {
        type: 'string',
        format: 'time',
      },
      end: {
        type: 'string',
        format: 'time',
      },
      students: {
        type: 'array',
        items: idValidationSchema,
      },
    },
    required: ['idUserHasSubject', 'name', 'day', 'start', 'end', 'students'],
    additionalProperties: false,
  },
  updateCourse: {
    type: 'object',
    properties: {
      name: nameValidationSchema,
      day: {
        enum: [
          'Poniedziałek',
          'Wtorek',
          'Środa',
          'Czwartek',
          'Piątek',
          'Sobota',
          'Niedziela',
        ],
      },
      start: {
        type: 'string',
        format: 'time',
      },
      end: {
        type: 'string',
        format: 'time',
      },
      students: {
        type: 'array',
        items: idValidationSchema,
      },
    },
    required: ['name', 'day', 'start', 'end', 'students'],
    additionalProperties: false,
  },
  createPresence: {
    type: 'object',
    properties: {
      idCourseHasStudent: idValidationSchema,
      present: {
        type: 'boolean',
      },
    },
    required: ['idCourseHasStudent', 'present'],
    additionalProperties: false,
  },
  updatePresence: {
    type: 'object',
    properties: {
      present: {
        type: 'boolean',
      },
    },
    required: ['present'],
    additionalProperties: false,
  },
  createGrade: {
    type: 'object',
    properties: {
      idCourseHasStudent: idValidationSchema,
      idGradeType: idValidationSchema,
      value: {
        type: 'integer',
        minimum: 1,
        maximum: 6,
      },
    },
    required: ['idCourseHasStudent', 'idGradeType', 'value'],
    additionalProperties: false,
  },
  updateGrade: {
    type: 'object',
    properties: {
      idGradeType: idValidationSchema,
      value: {
        type: 'integer',
        minimum: 1,
        maximum: 6,
      },
    },
    required: ['idGradeType', 'value'],
    additionalProperties: false,
  },
};

export default validationSchemas;
