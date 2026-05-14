import express from "express"

export class AppError extends Error{
    constructor(public message:any,public statusCode:number = 500){
        super(message)
        this.message = message,
        this.statusCode = statusCode
    }
}

export const globalErrorHandler = (
  err: AppError,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const status = (err.statusCode as number) || 500;
  res.status(status).json({
    message: err.message,
    status: status,
    stack: err.stack,
  });
};
