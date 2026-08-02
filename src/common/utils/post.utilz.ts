import { availabilityEnum } from "../enum/post.enum"
import {Types} from "mongoose"
import { Request } from "express"
export const AvailabilityPost = (req:Request)=>{
    return{
        $or:[{availability:availabilityEnum.private},
              {availability:availabilityEnum.private,createdBy:req.user._id},
              {availability:availabilityEnum.friends,createdBy:{$in:[...(req.user?.friends||[]),req.user._id]}},
              {tags:{$in:[req.user?._id]}}
        ]
    }
}


