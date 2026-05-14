import * as z from "zod";
import { GenderEnum } from "../../common/enum/user.enum";
import {
  AllowCommentsEnum,
  availabilityEnum,
} from "../../common/enum/post.enum";
import { Types } from "mongoose";

export const createPostSchema = {
  body: z
    .object({
      content: z.string().optional(),
      attachments: z.array(z.string()).optional(),
      tags: z
        .array(
          z.string().refine(
            (value) => {
              return Types.ObjectId.isValid(value);
            },
            {
              message: "Invalid tag id",
            },
          ),
        )
        .optional(),
      availability: z
        .enum(availabilityEnum)
        .default(availabilityEnum.public)
        .optional(),
      allowComments: z
        .enum(AllowCommentsEnum)
        .default(AllowCommentsEnum.allow)
        .optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.content && !data.attachments?.length) {
        ctx.addIssue({
          code: "custom",
          message: "Either content or attachments must be provided",
        });
      }
      if(data?.tags){
        const uniqueTags = new Set(data.tags);
        if(data.tags.length !== uniqueTags.size){
          ctx.addIssue({
            code: "custom",
            message: "Duplicate tags are not allowed",
          });
        }
      }
    }),
};
