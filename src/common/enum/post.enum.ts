import mongoose, { Types } from "mongoose";
export enum AllowCommentsEnum {
    allow = "allow",
    deny = "deny"
}
export enum availabilityEnum {
    public = "public",
    private =  "private",
    friends = "friends",
}