import { Server as HttpSever } from "http";
import { Server } from "socket.io";
import redisService from "../../common/service/redis.service";
import { decodeToken_and_fetchUser } from "../../common/middleware/authentication";
import chatGateway from "../chat/realtime/chat.gateway";

class SocketGateway {
  constructor() {}
  initIo = async (httpServer: HttpSever) => {
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
      },
    });
    io.use(async (socket, next) => {
      try {
        console.log(socket.id);
        console.log("socket");
        const { user } = await decodeToken_and_fetchUser(
          socket.handshake.auth.authorization ||
            socket.handshake.headers.authorization,
        );
        socket.data.user = user;
        next();
      } catch (error: any) {
        console.error("Socket Auth Error:", error.message || error);
        next(error);
      }
    });
    io.on("connection", async (socket) => {
      redisService.addSocket({
        userId: socket.data.user._id,
        SocketToken: socket.handshake.auth.socketid || socket.id,
      });
      await chatGateway.registerEvent(socket)
      console.log({
        userSocketIds: await redisService.getSockets(socket.data.user._id),
      });
      socket.on("disconnect", async () => {
        await redisService.removeSocket({
          userId: socket.data.user._id,
          SocketToken: socket.id,
        });
        console.log({
          userSocketIdsAfterDisconnect: await redisService.getSockets(
            socket.data.user._id,
          ),
        });
      });
    });
  };
}

export default new SocketGateway();
