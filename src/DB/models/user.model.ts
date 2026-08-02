import mongoose, { Types } from "mongoose";
import { providerEnum, RoleEnum } from "../../common/enum/user.enum";
// import {GenderEnum}

export interface IUser {
  _id: Types.ObjectId;
  Fname: string;
  Lname: string;
  userName: string;
  email: string;
  password: string;
  age: number;
  phone?: string;
  address?: string;
  gender?: string;
  role: string;
  profileImage?: string;
  confirmed?: boolean;
  createdAt: Date;
  updatedAt: Date;
  provider?: string;
  friends?:Types.ObjectId[]
}

const userSchema = new mongoose.Schema<IUser>(
  {
    Fname: { type: String, trim: true, min: 3, max: 30, required: true },
    Lname: { type: String, trim: true, min: 3, max: 30, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, trim: true, min: 6, max: 30, required:function():boolean{
      return this.provider === providerEnum.system ? true : false;
    }},
    age: { type: Number, required: true },
    phone: { type: String },
    address: { type: String },
    gender: { type: String },
    role: { type: String, default: RoleEnum.user, required: true },
    confirmed: { type: Boolean, default: false },
    provider: { type: String, enum: [providerEnum.system, providerEnum.google],default: providerEnum.system },
    profileImage: { type: String, default: "" },
    friends:[{type:Types.ObjectId, ref:"User"}]
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema
  .virtual("userName")
  .get(function (this: IUser) {
    return `${this.Fname} ${this.Lname}`;
  })
  .set(function (value: string) {
    this.set({ Fname: value.split(" ")[0], Lname: value.split(" ")[1] });
  });

const userModel =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default userModel;
