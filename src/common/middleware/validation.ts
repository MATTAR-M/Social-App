import {Request,Response,NextFunction} from "express";
import { ZodType } from "zod";
import { AppError } from "../utils/globalErrorHandling";
// FIX 1: Explicitly use express.Request instead of the global DOM Request
type reqType = keyof Request;
type schemaType = Partial<Record<reqType, ZodType>>;

export const Validation = (schema: schemaType) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const errorValidation = [];
    for (const key of Object.keys(schema) as reqType[]) {
      if (!schema[key]) continue;
      if (req?.file){
        req.body.attachments = req.files;
      }

      const result = await schema[key].safeParseAsync(req[key]);

      if (!result.success) {
        const errors = result.error.issues.map((err) => {
          return {
            key,
            path: err.path[0],
            message: err.message,
          };
        });
        errorValidation.push(...errors);
      }
    }
    if (errorValidation.length > 0) {
      throw new AppError(JSON.parse(JSON.stringify(errorValidation)), 400);
    }
    next();
  };
};
