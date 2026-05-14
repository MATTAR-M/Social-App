import { createClient } from "redis";
import { redis_Client } from "../../DB/redis/redis.connection";
import { redisURL } from "../../config/config.service";
import { Types } from "mongoose";
import { emailEventEnum } from "../enum/email.enum";

 class RedisService {
  private readonly client = redis_Client;
  constructor() {
    this.client = createClient({
      url: redisURL!,
    });
  }

  handleEvents(){
    this.client.on("error",(error)=>{
    if(error){
      console.log("Falied to connect to redis", error)
    }
  })
  }

  async connect() {    try {
      await this.client.connect();
      console.log("Redis connection has been established🫡  🫡");
    } catch (error) {
      console.log("Redis connection has been failed", error);
    }
  }
 revoked_key = ({ userId, jti}:{userId:Types.ObjectId,jti:string}) => {
    return `revokeToken::${userId}::${jti}`;
  };
 get_Key = ({ userId}:{userId:Types.ObjectId}) => {
    return `revokeToken::${userId}`;
  };
  
 setValue = async ({ key, value, ttl}:{key:string,value:string|object,ttl:number}) => {
     try{
        const data = typeof value === "string" ? value : JSON.stringify(value);
      return ttl
        ? await this.client.set(key, data, { EX: ttl })
        : await this.client.set(key, data);
    } catch (error) {
      console.log(error, "failed to set value in redis");
    }
  };
  
 update = async ({ key, value, ttl }:{key:string,value:string|object,ttl:number}) => {
    try {
      return await this.setValue({ key, value, ttl });
    } catch (error) {
      console.log(error, "failed to update value in redis");
    }
  };
  
 getValue = async ({ key }:{key:string}) => {
    try {
      try {
        return JSON.parse(await this.client.get(key)as string);
      } catch (error) {
        return await this.client.get(key);
      }
    } catch (error) {
      console.log(error, "failed to get value in redis");
    }
  };
  
 ttl = async ({ key }:{key:string}) => {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.log(error, "failed to get ttl value in redis");
    }
  };
  
 exsit = async ({ key }:{key:string}) => {
    try {
      return await this.client.exists(key);
    } catch (error) {
      console.log(error, "failed to get exsit value in redis");
    }
  };
  
 expire = async ({ key, ttl }:{key:string,ttl:number}) => {
    try {
      return await this.client.expire(key, ttl);
    } catch (error) {
      console.log(error, "failed to set expire value in redis");
    }
  }
  
 deleteKey = async ({ key }:{key:string|string[]}) => {
    try {
      if (!key.length) return 0;
      return await this.client.del(key);
    } catch (error) {
      console.log(error, "failed to delete value in redis");
    }
  };
  
 key = async (pattern:string) => {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      console.log(error, "failed to get keys in redis");
    }
  };
  
 incr = async (key:string) => {
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.log(error, "failed to increment in redis");
    }
  };
  
 otpKey = ({ email,subject = emailEventEnum.confirmEmail }:{email:string,subject?:emailEventEnum}) => {
    return `otp::${email}::${subject}`;
  };
 max_OtpKey = ({ email }:{email:string}) => {
    return `${this.otpKey({email})}::otpCount`;
  };
 block_OtpKey = ({ email }:{email:string}) => {
    return `${this.otpKey({ email })}::Blocked`;
  };
  
nkey (userId:Types.ObjectId){
  return `user:FCM:${userId}`
}

async addFCM({userId,FCMToken}:{userId:Types.ObjectId,FCMToken:string}){
  return await this.client.sAdd(this.nkey(userId),FCMToken)
}
async removeFCM({userId,FCMToken}:{userId:Types.ObjectId,FCMToken:string}){
  return await this.client.sRem(this.nkey(userId),FCMToken)
}
async getFCMs(userId:Types.ObjectId){
  return await this.client.sMembers(this.nkey(userId))
}
async hasFCMs(userId:Types.ObjectId){
  return await this.client.sCard(this.nkey(userId))
}
async removeFCMUser(userId:Types.ObjectId){
  return await this.client.del(this.nkey(userId))
}
}


export default new RedisService();