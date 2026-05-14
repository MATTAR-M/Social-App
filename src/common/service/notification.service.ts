import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { AppError } from "../utils/globalErrorHandling";
import { promise } from "zod/mini";

class NotificationService {
  private readonly client: admin.app.App;

  constructor() {
    try {
      // 1. Resolve path relative to the current file
      const configPath = resolve(
        __dirname,
        "../../../src/config/social-app-33589-firebase-adminsdk-fbsvc-e1f78122a3.json",
      );

      // 2. Read with 'utf8' to ensure it returns a string
      const fileContent = readFileSync(configPath, "utf8");

      // 3. Parse and Initialize
      const serviceAccount = JSON.parse(fileContent);

      this.client = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log("Firebase Admin initialized successfully.");
    } catch (error) {
      throw new AppError(error);
      // Log the path to verify where it's looking
      console.error(
        "Attempted to read from:",
        resolve(__dirname, "../../config/.."),
      );
    }
  }

  async sendNotification({ token, data }: { token: string; data: any }) {
    const message = {
      token,
      notification: {
        title: data.title,
        body: data.body,
      },
    };
    return await this.client.messaging().send(message);
  }
   async sendNotifications({ tokens, data }: { tokens: string[], data: any }) {
    return await Promise.all(tokens.map((token)=>{
      return this.sendNotification({token,data})
    }));
  }
}

export default new NotificationService();
