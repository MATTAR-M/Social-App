import * as z from "zod";
import { GenderEnum } from "../../common/enum/user.enum";



export type ISignup = z.infer<typeof signUpSchema.body>

export const getUserSchema = z.strictObject({ 
  token: z.string()
})

export const confirmEmailSchema = {
  body: z.object({
    email: z.string().email().toLowerCase().trim(),
    code: z.string().min(6).max(6).regex(/^\d+$/, "Code must be a 6-digit number"),
  })
}

export const reSendOtpSchema = {
  body: z.object({
    email: z.string().email().toLowerCase().trim(),
  })
}
export const singInSchema = {
  body: reSendOtpSchema.body.safeExtend({
    email: z.string().email().toLowerCase().trim(),
    password: z.string().min(6),
    fcm: z.string().optional(),
  })
}

export const signUpSchema = {
  body: singInSchema.body.safeExtend({
    userName: z.string().min(3).max(25),
    cPassword: z.string().min(6),
    age: z.number().min(18).max(100),
    gender: z.enum(GenderEnum).optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
  }).superRefine((data,ctx)=>{
    if(data.password !== data.cPassword){
      ctx.addIssue({
        code:"custom",
        path:["cPassword"],
        message:"Password does not match cPassword" 
      })
    }
  })

  





  // .refine((data)=>{
  //   return data.password === data.cPassword
  // },{
  //   error:"password does not match cPassword",
  //   path:["cPassword"]
  // }),
}
