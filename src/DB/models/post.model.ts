import mongoose, { Types } from "mongoose";
import { providerEnum, RoleEnum } from "../../common/enum/user.enum";
import { AllowCommentsEnum ,availabilityEnum} from "../../common/enum/post.enum";
// import {GenderEnum}

export interface IPost {
content?:string,
attachments?:string[],
createdBy: Types.ObjectId,
tags?:Types.ObjectId[],
likes?: Types.ObjectId[],
allowComments?:AllowCommentsEnum,
availability?:availabilityEnum,
folderId: Types.ObjectId,
}
const postSchema = new mongoose.Schema<IPost>({
    content: { type: String, trim: true, max: 500,required: function(this){
      return !this.attachments?.length;
    } },
    attachments: [String],
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    tags: { type: Types.ObjectId, ref: "User" },
    likes: { type: Types.ObjectId, ref: "User" },
    allowComments: { type: String, enum: AllowCommentsEnum, default: AllowCommentsEnum.allow },
    availability: { type: String, enum: availabilityEnum, default: availabilityEnum.public },
    folderId: String
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


const postModel =
  mongoose.models.Post || mongoose.model<IPost>("Post", postSchema);
export default postModel;
