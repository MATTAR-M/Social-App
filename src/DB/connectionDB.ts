import mongoose from "mongoose"
import {MONGO_URI} from "../config/config.service"

export const checkConenction = async()=>{
    try{
        if (!MONGO_URI) {
            throw new Error("🚨 MONGO_URI is missing! Check your .env file.");
          }
    await mongoose.connect(MONGO_URI)
    console.log("DataBase Connected Successfully👍  👍")
    }catch(error){
        console.log(error)
    }
}

