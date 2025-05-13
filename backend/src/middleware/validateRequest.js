import { ApiError } from "../utils/api-errors.js";

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const formattedErrors = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));

      return res.status(400).json(new ApiError(400, "🛑 Validation failed", formattedErrors));
    }

    req.body = result.data;
    next();
  };
};
