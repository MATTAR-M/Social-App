import { z } from "zod";
import { confirmEmailSchema, reSendOtpSchema, signUpSchema, singInSchema } from "./user.validation";

// export interface ISignup {
//     name : string,
//     email:string,
//     password:string,
// } 


export type SignupRequestDto = z.infer<typeof signUpSchema.body>
export type SignInRequestDto = z.infer<typeof singInSchema.body>
export type ConfirmEmailDto = z.infer<typeof confirmEmailSchema.body>
export type reSendOtpDto = z.infer<typeof reSendOtpSchema.body>