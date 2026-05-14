import express from "express";
import { ZodType } from "zod";
import { AppError } from "../utils/globalErrorHandling";

// FIX 1: Explicitly use express.Request instead of the global DOM Request
type reqType = keyof express.Request;
type schemaType = Partial<Record<reqType, ZodType>>;

export const Validation = (schema: schemaType) => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const validationErro = []
    for (const key of Object.keys(schema) as reqType[]) {
      const validator = schema[key];
      if (!validator) continue;

      const result = validator.safeParse(req[key]);

      if (!result.success) {
        validationErro.push(result.error.message);
      }
    }
    if(validationErro.length>0){
        throw new AppError(JSON.parse(validationErro as unknown as string),400)
    }
    next();
  };
};
