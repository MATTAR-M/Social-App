import {Router} from "express"
import PostService from "./post.service"
import { Validation } from "../../common/middleware/validation"
import * as UV from "./post.validation"
import { authentication } from "../../common/middleware/authentication"
const postRouter = Router()


postRouter.get("/",authentication,PostService.createPost)



export default postRouter