import mongoose, { Types } from "mongoose";
import { providerEnum, RoleEnum } from "../../common/enum/user.enum";
import {
  AllowCommentsEnum,
  availabilityEnum,
} from "../../common/enum/post.enum";
import { timeStamp } from "node:console";
export interface IMessage{
  createdBy : Types.ObjectId;
  content: string
}
export interface IChat {
  //ovo
  createdBy: Types.ObjectId;
  participants : Types.ObjectId[],
  messages: IMessage[]
  //ovm
  group:string,
  groupImage:string,
  roomId:string
}
const messageSchema = new mongoose.Schema<IMessage>(
  {content:{
    type:String,
    required:true
  },
  createdBy:{
    type:Types.ObjectId,
    ref:"User",
    required:true
  }
},{
    timestamps:true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)
const ChatSchema = new mongoose.Schema<IChat>(
  {
    participants: [{ type: Types.ObjectId, ref: "User", required: true }],
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    messages: [messageSchema],
    group:String,
    groupImage:String,
    roomId:String,
    },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const ChatModel = mongoose.models.Chat || mongoose.model<IChat>("chat", ChatSchema);
export default ChatModel;
