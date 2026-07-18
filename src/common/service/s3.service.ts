import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  AWS_ACCESS_KEY,
  AWS_BUCKET_NAME,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} from "../../config/config.service";
import { randomUUID } from "node:crypto";
import { store_Enum } from "../enum/multer.enum";
import fs from "node:fs";
import { AppError } from "../utils/globalErrorHandling";
import { Upload } from "@aws-sdk/lib-storage";

export class S3Service {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  async uploadFile({
    file,
    store_Type = store_Enum.memory,
    path = "General",
    ACL = ObjectCannedACL.private,
  }: {
    file: Express.Multer.File;
    store_Type?: store_Enum;
    ACL?: ObjectCannedACL;
    path?: string;
  }): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      ACL,
      Key: `social-media-app/${path}/${randomUUID()}___${file.originalname}`,
      Body:
        store_Type === store_Enum.memory
          ? file.buffer
          : fs.createReadStream(file.path),
      ContentType: file.mimetype,
    });
    if (!command.input.Key) throw new AppError("File Key is empty");
    await this.s3Client.send(command);
    return command.input.Key;
  }
  async uploadLargeFile({
    file,
    store_Type = store_Enum.disk,
    path = "General",
    ACL = ObjectCannedACL.private,
  }: {
    file: Express.Multer.File;
    store_Type?: store_Enum;
    ACL?: ObjectCannedACL;
    path?: string;
  }): Promise<string> {
    const command = new Upload({
      client: this.s3Client,
      params: {
        Bucket: AWS_BUCKET_NAME,
        ACL,
        Key: `social-media-app/${path}/${randomUUID()}___${file.originalname}`,
        Body:
          store_Type === store_Enum.memory
            ? file.buffer
            : fs.createReadStream(file.path),
        ContentType: file.mimetype,
      },
    });
    const result = await command.done();
    return result.Key as string;
  }
  async uploadFiles({
files,
store_Type = store_Enum. memory,
path = "General",
ACL = ObjectCannedACL.private,
isLarge = false
  }:{
files: Express.Multer.File[],
store_Type   ?: store_Enum,
path ?: string
ACL ?: ObjectCannedACL,
isLarge ?: boolean
  }){
let urls: string[] = []
if (isLarge) {
urls = await Promise.all(files.map((file) => {
return this.uploadLargeFile({ file, store_Type, path, ACL })
}))
} else {
urls = await Promise.all(files.map((file) => {
return this.uploadFile({ file, store_Type, path, ACL })
}))
}
return urls
}
}
