import { z } from "zod";
import { createPostSchema } from "./post.validation";


export type createPostDto = z.infer<typeof createPostSchema>;