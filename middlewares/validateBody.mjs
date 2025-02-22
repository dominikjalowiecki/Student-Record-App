import createError from 'http-errors';
import { Ajv } from 'ajv';
import addFormats from 'ajv-formats';

function validateBody(schema) {
  const ajv = new Ajv({
    allErrors: true,
    $data: true,
  });

  addFormats.default(ajv);

  const validate = ajv.compile(schema);

  return (req, res, next) => {
    const valid = validate(req.body);
    if (!valid) {
      const error = validate.errors[0];
      let errorMessage = error.message;

      if (error.instancePath) {
        errorMessage += `: '${error.instancePath}'`;
      }

      return next(createError(400, errorMessage));
    }

    next();
  };
}

export default validateBody;
