import * as z from "zod";
import { GenderEnum } from "../../common/enum/user.enum";
import {
  AllowCommentsEnum,
  availabilityEnum,
} from "../../common/enum/post.enum";
import { Types } from "mongoose";
import { generalRules } from "../../common/utils/general.rules";
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

      availability: z.enum(availabilityEnum).default(availabilityEnum.public),

      allowComments: z.enum(AllowCommentsEnum).default(AllowCommentsEnum.allow),
      folderId: z.string().uuid().optional(),
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
  };
  export const likePostSchema = {
    params: z.strictObject({
      postId: generalRules.id,
    }),
  };
export const updatePostSchema = {
  body: z
    .object({
      content: z.string().optional(),
      attachments: z.array(z.string()).optional(),
      removeFiles: z.array(z.string()).optional(),
      removeTags:z.array(generalRules.id).optional(),
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

      availability: z.enum(availabilityEnum).default(availabilityEnum.public),

      allowComments: z.enum(AllowCommentsEnum).default(AllowCommentsEnum.allow),
      folderId: z.string().uuid().optional(),
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
};
