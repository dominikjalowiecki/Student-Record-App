import { Ajv } from 'ajv';

export function trimStringProperties(object) {
  if (object !== null && typeof object === 'object') {
    for (const [key, value] of Object.entries(object)) {
      if (typeof value === 'object') {
        trimStringProperties(value);
      }

      if (typeof value === 'string') {
        object[key] = value.trim();
      }
    }
  }
}

export const idValidationSchema = {
  type: 'integer',
  minimum: 0,
  maximum: 2147483647,
};

export const nameValidationSchema = {
  type: 'string',
  maxLength: 200,
};

export const pageValidationSchema = {
  type: 'integer',
  minimum: 1,
  maximum: 2147483647,
};

export function validateId(id) {
  return validate(idValidationSchema, id);
}

export function validatePage(page) {
  return validate(pageValidationSchema, page);
}

function validate(schema, value) {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(value);

  return valid;
}

export function formatDate(date) {
  let day = '' + date.getDate(),
    month = '' + (date.getMonth() + 1),
    year = date.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

export function dayStringToDayNumber(day) {
  switch (day) {
    case 'Poniedziałek':
      return 1;
    case 'Wtorek':
      return 2;
    case 'Środa':
      return 3;
    case 'Czwartek':
      return 4;
    case 'Piątek':
      return 5;
    case 'Sobota':
      return 6;
    default: // Niedziela
      return 0;
  }
}
