import { createClient } from "redis";
import { redisURL } from "../../config/config.service";


export const redis_Client = createClient({
    url : redisURL!
})
export const redis_Connection = async () => {
    await redis_Client.connect()
    .then(()=>{
        console.log("Redis connection has been established🫡  🫡")
    })
    .catch((error:any)=>{
        console.log("Redis connection has been failed", error)
    }   )
};