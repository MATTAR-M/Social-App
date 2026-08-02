import { z } from "zod";
import { createcommentSchema } from "./comment.validation";

export type createCommentDto = z.infer<typeof createcommentSchema.body>;
