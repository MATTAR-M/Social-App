import { Model } from "mongoose";
import { AppError } from "../../common/utils/globalErrorHandling";
import BaseRepo from "./base.repo";
import commentModel, { IComment } from "../models/comment.model";

class CommentRepo extends BaseRepo<IComment>{
  constructor(protected readonly model: Model<IComment>=commentModel) {
    super(model)
  }


  // async checkUser(email:string){
  //   const ExistUser = await this.model.findOne({ email });
  //   if(ExistUser) throw new AppError("email already exist", 409); 
  //   return true
  // }

  


}
export default CommentRepo;
