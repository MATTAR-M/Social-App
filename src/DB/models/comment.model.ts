import mongoose, { Types } from "mongoose";
import { providerEnum, RoleEnum } from "../../common/enum/user.enum";
import { AllowCommentsEnum ,availabilityEnum, OnModelEnum} from "../../common/enum/post.enum";
// import {GenderEnum}

export interface IComment {
content?:string,
attachments?:string[],
createdBy: Types.ObjectId,
tags?:Types.ObjectId[],
likes?: Types.ObjectId[],
folderId: Types.ObjectId,
refId: Types.ObjectId,
OnModel: OnModelEnum,
}
const commentSchema = new mongoose.Schema<IComment>({
    content: { type: String, trim: true, max: 500,required: function(this){
      return !this.attachments?.length;
    } },
    attachments: [String],
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    tags: { type: Types.ObjectId, ref: "User" },
    likes: { type: Types.ObjectId, ref: "User" },
    folderId: String,
    refId: { type: Types.ObjectId, refPath: "Post",required: true },
    OnModel: { type: String, enum: OnModelEnum, required: true },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
commentSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "refId",
})

const commentModel =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", commentSchema);
export default commentModel;
