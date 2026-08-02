import * as z from "zod";
import { GenderEnum } from "../../common/enum/user.enum";
import {
  AllowCommentsEnum,
  availabilityEnum,
  OnModelEnum,
} from "../../common/enum/post.enum";
import { Types } from "mongoose";
import { generalRules } from "../../common/utils/general.rules";
export const createcommentSchema = {
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

      folderId: z.string().uuid().optional(),
      onModel: z.enum(OnModelEnum),
      
    })
    .superRefine((data, ctx) => {
      if (!data.content && !data.attachments?.length) {
        ctx.addIssue({
          code: "custom",
          message: "Either content or attachments must be provided",
        });
      }
      if (data?.tags) {
        const uniqueTags = new Set(data.tags);
        if (data.tags.length !== uniqueTags.size) {
          ctx.addIssue({
            code: "custom",
            message: "Duplicate tags are not allowed",
          });
        }
      }
    }),
    params: z.object({
  postId: generalRules.id,
  commentId: generalRules.id.optional(),
}),
  };
