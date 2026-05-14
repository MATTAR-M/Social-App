import express, { NextFunction } from "express";
import { ISignup } from "./user.validation";
import * as z from "zod";
import { AppError } from "../../common/utils/globalErrorHandling";
import { signUpSchema } from "./user.validation";
import userModel, { IUser } from "../../DB/models/user.model";
import { HydratedDocument, Model } from "mongoose";
import BaseRepo from "../../DB/repos/user.repo";
import UserRepo from "../../DB/repos/user.repo";
import { encrypt } from "../../common/utils/security/encrypt.security";
import { hash, randomUUID } from "node:crypto";
import { Compare, Hash } from "../../common/utils/security/hash.security";
import { generateOtp, sendEmail } from "../../common/utils/emial/sendEmail";
import { emailTemplate } from "../../common/utils/emial/email.template";
import eventemitter from "../../common/utils/emial/email.event";
import { emailEventEnum } from "../../common/enum/email.enum";
import { Response, Request } from "express";
import { successResponse } from "../../common/utils/response.succ";
import {
  ConfirmEmailDto,
  reSendOtpDto,
  SignInRequestDto,
  SignupRequestDto,
} from "./auth.dto";
import RedisService from "../../common/service/redis.service";
import {
  CLIENT_ID,
  Refresh_SECRET_KEY_ADMIN,
  Refresh_SECRET_KEY_USER,
  SECRET_KEY_ADMIN,
  SECRET_KEY_USER,
} from "../../config/config.service";
import TokenService from "../../common/utils/token.serivce";
import { providerEnum, RoleEnum } from "../../common/enum/user.enum";
import redisService from "../../common/service/redis.service";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { uuidv4 } from "zod";
import NotificationService from "../../common/service/notification.service";
class UserService {
  private readonly _userModel = new UserRepo();
  private readonly _redisService = RedisService;
  private readonly _tokenService = TokenService;
  private readonly _notificationService = NotificationService;

  constructor() { }

  signUp = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    let {
      userName,
      email,
      password,
      cPassword,
      age,
      gender,
      address,
      phone,
    }: SignupRequestDto = req.body;
    await this._userModel.checkUser(email);
    const otp = await generateOtp();
    eventemitter.emit(emailEventEnum.confirmEmail, async () => {
      await sendEmail({
        to: email,
        subject: "Email Confirmation",
        html: emailTemplate(otp),
      });
      await this._redisService.setValue({
        key: this._redisService.otpKey({
          email,
          subject: emailEventEnum.confirmEmail,
        }),
        value: Hash({ plainText: `${otp}` }),
        ttl: 60 * 2,
      });
      await this._redisService.setValue({
        key: this._redisService.max_OtpKey({ email }),
        value: "1",
        ttl: 30,
      });
    });
    const user = await this._userModel.create({
      userName,
      email,
      password: Hash({ plainText: password }),
      age,
      gender,
      address,
      phone: phone ? encrypt(phone) : null,
    } as Partial<IUser>);

    res.status(200).json({ message: "sign up is successful", data: user });
  };

  confirmEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { email, code }: ConfirmEmailDto = req.body;

    const otpValue = await this._redisService.getValue({
      key: this._redisService.otpKey({ email }),
    });

    if (!otpValue) {
      throw new AppError("otp expired");
    }

    if (!Compare({ plainText: String(code), cipherText: otpValue })) {
      throw new AppError("inValid otp");
    }

    const user = await this._userModel.findOneAndUpdate({
      filter: {
        email,
        confirmed: false,
      },
      update: { confirmed: true },
    });

    if (!user) {
      throw new AppError("user not found", 404);
    }

    await this._redisService.deleteKey({
      key: this._redisService.otpKey({ email }),
    });
    await this._redisService.deleteKey({
      key: this._redisService.max_OtpKey({ email }),
    });

    successResponse({
      res,
      message: "email confirmed successfully",
    });
  };

  signIn = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, fcm }: SignInRequestDto = req.body;
    const user = await this._userModel.findOne({
      filter: { email, confirmed: { $exists: true } },
    });
    if (!user) {
      //   res.status(409).json({ message: `user does not exist` });
      throw new AppError("user does not exist", 404);
    }
    if (!Compare({ plainText: password, cipherText: user.password })) {
      //   res.status(400).json({ message: `invalid password` });
      throw new AppError("invalid password", 600);
    }
    const jwtid = randomUUID();
    const accessToken = this._tokenService.generateToken({
      payload: { id: user._id, email: user.email },
      secritKey:
        user?.role == RoleEnum.user ? SECRET_KEY_USER! : SECRET_KEY_ADMIN!,
      options: {
        expiresIn: "1h",
        // issuer:"Matar",
        // audience:"People",
        jwtid,
        // noTimestamp:true,
        // notBefore:'1m'
      },
    });
    const refreshToken = this._tokenService.generateToken({
      payload: { id: user._id, email: user.email },
      secritKey:
        user?.role == RoleEnum.user
          ? Refresh_SECRET_KEY_USER!
          : Refresh_SECRET_KEY_ADMIN!,
      options: {
        expiresIn: "7d",
        jwtid,
      },
    });
    if(fcm){
      await this._redisService.addFCM({userId:user._id,FCMToken:fcm})
      const tokens = await this._redisService.getFCMs(user._id)
      await this._notificationService.sendNotifications({tokens,data:{title:`hello ${user.userName}`,body:`new Login ${new Date()}`}})
    }
    successResponse({
      res,
      message: "Successful sign in",
      data: { accessToken, refreshToken },
    });
  };
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    successResponse({
      res,
      message: "Profile fetched successfully",
      data: { user: req.user },
    });
  };
  sendEmailotp = async ({
    email,
    subject,
  }: {
    email: string;
    subject: emailEventEnum;
  }) => {
    const blocked = await RedisService.ttl({
      key: RedisService.block_OtpKey({ email }),
    });
    if (blocked && blocked > 0) {
      throw new AppError(
        `you are blocked from requesting otp, please try again after ${blocked}seconds`,
        409
      );
    }
    const otpTtl = await RedisService.ttl({
      key: RedisService.otpKey({ email, subject }),
    });
    if (otpTtl && otpTtl > 0) {
      throw new AppError(
        `you can request new otp after ${otpTtl} seconds`,
        400
      );
    }
    const maxOtp = await RedisService.getValue({
      key: RedisService.max_OtpKey({ email }),
    });
    if (maxOtp >= 3) {
      await RedisService.setValue({
        key: RedisService.block_OtpKey({ email }),
        value: "1",
        ttl: 60 * 1,
      });
      throw new AppError(
        `you have exceeded the maximum number of otp requests, please try again later`,
        429
      );
    }
    const otp = await generateOtp();
    eventemitter.emit(emailEventEnum.confirmEmail, async () => {
      await sendEmail({
        to: email,
        subject: "welcome",
        html: emailTemplate(otp),
      });
      await RedisService.setValue({
        key: RedisService.otpKey({ email, subject }),
        value: Hash({ plainText: `${otp}` }),
        ttl: 60 * 2,
      });
      await RedisService.incr(RedisService.max_OtpKey({ email }));
    });
  };

  resendOtp = async (req: Request, res: Response, next: NextFunction) => {
    const { email }: reSendOtpDto = req.body;

    const user = await this._userModel.find({
      filter: {
        email,
        confirmed: { $exists: false },
      },
    });
    if (!user) {
      throw new AppError("user not found or has been confirmed", 404);
    }
    await this.sendEmailotp({ email, subject: emailEventEnum.confirmEmail });

    successResponse({
      res,
      status: 201,
      message: "Otp resent successfully",
    });
  };
  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const user = await this._userModel.findOne({
      filter: {
        email,
        confirmed: { $exists: true },
      }
    });
    if (!user) {
      throw new Error("user does not exist", { cause: 404 });
    }
    await this.sendEmailotp({ email, subject: emailEventEnum.forgetPassword });
    successResponse({
      res,
      status: 201,
      message: "otp sent to email successfully",
    });
  };
  resetPassword = async (req: Request, res: Response, next: NextFunction) => {  
    const { email, code, password } = req.body

    const otpValue = await RedisService.getValue({ key: RedisService.otpKey({ email, subject: emailEventEnum.forgetPassword }) })
    if (!otpValue) {
      throw new Error("otp expired");
    }
    if (!Compare({ plainText: code, cipherText: otpValue })) {
      throw new Error("inValid otp");
    }
    const user = await this._userModel.findOneAndUpdate({
      filter: {
        email,
        confirmed: { $exists: true }
      },
      update: {
        password: Hash({ plainText: password }),
        changeCredentials: new Date()
      }
    })
    if (!user) {
      throw new Error("user does not exist")
    }
    await RedisService.deleteKey({ key: RedisService.otpKey({ email, subject: emailEventEnum.forgetPassword }) })
    successResponse({ res, status: 201, message: `Password has been Reseted` })
  }
  signUpWithGmail = async (req: Request, res: Response, next: NextFunction) => {
    const { idToken } = req.body;
    console.log(idToken);
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID!,   
    });
    const payload = ticket.getPayload();
    const { email, email_verified, name } = payload as TokenPayload;
    let user = await this._userModel.findOne({
      filter: { email:email! },
    });
    if (!user) {
      user = await this._userModel.create({
          email:email!,
          confirmed: email_verified!,
          userName: name!,
          provider: providerEnum.google
      });
    }
    if (user.provider == providerEnum.system) {
      throw new Error("please log in with google only", { cause: 406 });
    }
    const accessToken = this._tokenService.generateToken({
      payload: { id: user._id, email: user.email },
      secritKey: SECRET_KEY_USER!,
      options: {
        expiresIn: "1h",
        jwtid: randomUUID(),
      },
    });
  };
}
export default new UserService();
