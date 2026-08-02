import { z } from "zod";
import { createPostSchema, updatePostSchema } from "./post.validation";

export type createPostDto = z.infer<typeof createPostSchema.body>;
export type updatePostDto = z.infer<typeof updatePostSchema.body>;
