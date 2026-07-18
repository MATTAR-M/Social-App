import {Router} from "express"
import UserService from "./user.service"
import { Validation } from "../../common/middleware/validation"
import * as UV from "./user.validation"
import { authentication } from "../../common/middleware/authentication"
import multerCloud from "../../common/middleware/multer.cloud"
import { store_Enum } from "../../common/enum/multer.enum"
const authRouter = Router()

authRouter.post("/signup",Validation(UV.signUpSchema),UserService.signUp)
authRouter.post("/signup/gmail",UserService.signUpWithGmail)
authRouter.post("/signin",Validation(UV.singInSchema),UserService.signIn)
authRouter.patch("/confirmemail",Validation(UV.confirmEmailSchema),UserService.confirmEmail)
authRouter.patch("/resend-otp",Validation(UV.reSendOtpSchema),UserService.resendOtp)
authRouter.get("/get-profile",authentication,UserService.getProfile)
authRouter.post("/upload-image",multerCloud({store_Type: store_Enum.memory}).array("images"),UserService.uploadImage)



export default authRouter