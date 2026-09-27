const { errorResponse } = require('../utils/apiResponse');

/**
 * Zod validation middleware factory
 * @param {import('zod').ZodSchema} schema - Zod validation schema
 * @param {'body' | 'query' | 'params'} source - Target request property to validate
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.name === 'ZodError') {
        const formattedErrors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return errorResponse(res, 'Validation Error: Invalid input parameters', 400, formattedErrors);
      }
      next(err);
    }
  };
};

module.exports = validate;
