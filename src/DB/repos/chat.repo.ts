import { Model } from "mongoose";
import { AppError } from "../../common/utils/globalErrorHandling";
import BaseRepo from "./base.repo";
import ChatModel, { IChat } from "../models/chat.model";

class ChatRepo extends BaseRepo<IChat>{
  constructor(protected readonly model: Model<IChat>=ChatModel) {
    super(model)
  }


  async checkUser(email:string){
    const ExistUser = await this.model.findOne({ email });
    if(ExistUser) throw new AppError("email already exist", 409); 
    return true
  }

  


}
export default ChatRepo;
