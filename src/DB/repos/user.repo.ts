import { QueryOptions, UpdateQuery } from "mongoose";
import { Types } from "mongoose";
import { PopulateOptions } from "mongoose";
import {
  HydratedDocument,
  ObjectId,
  ProjectionType,
  QueryFilter,
} from "mongoose";
import { Model } from "mongoose";
import { AppError } from "../../common/utils/globalErrorHandling";
import userModel, { IUser } from "../models/user.model";
import BaseRepo from "./base.repo";

class UserRepo extends BaseRepo<IUser>{
  constructor(protected readonly model: Model<IUser>=userModel) {
    super(model)
  }


  async checkUser(email:string){
    const ExistUser = await this.model.findOne({ email });
    if(ExistUser) throw new AppError("email already exist", 409); 
    return true
  }

  


}
export default UserRepo;
