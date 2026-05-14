import { Model } from "mongoose";
import { AppError } from "../../common/utils/globalErrorHandling";
import BaseRepo from "./base.repo";
import postModel, { IPost } from "../models/post.model";

class PostRepo extends BaseRepo<IPost>{
  constructor(protected readonly model: Model<IPost>=postModel) {
    super(model)
  }


  async checkUser(email:string){
    const ExistUser = await this.model.findOne({ email });
    if(ExistUser) throw new AppError("email already exist", 409); 
    return true
  }

  


}
export default PostRepo;
