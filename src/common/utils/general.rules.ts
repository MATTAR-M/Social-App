import { z } from "zod";
import { Types } from "mongoose";

export const generalRules = {
  // 1. Email with custom TLD validation (.com or .outlook)
  email: z
    .string()
    .email("Invalid email format")
    .refine(
      (val) => val.endsWith(".com") || val.endsWith(".outlook"),
      { message: "Only .com and .outlook domains are allowed" }
    ),

  // 2. Password with minimum length
  password: z
    .string({error: "body must not be empty" })
    .min(4, "Password must be at least 4 characters long"),

  // Note on cpassword (confirm password): 
  // In Zod, matching fields is done on the ENTIRE object using .refine() 
  // rather than on the individual field. See example below.

  // 3. Multer File Object
  file: z.object(
    {
      fieldname: z.string(),
      originalname: z.string(),
      encoding: z.string(),
      mimetype: z.string(),
      destination: z.string(),
      filename: z.string(),
      path: z.string(),
      size: z.number(),
    },
    { error: "file is required" }
  ),

  // 4. Mongoose ObjectId validation
  id: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid Id",
  }),
};