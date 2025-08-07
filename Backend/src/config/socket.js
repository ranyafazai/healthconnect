import { Server as SocketIOServer } from "socket.io";

let io;

export default {
  initSocket: (server) => {
    io = new SocketIOServer(server, {
      cors: {
        origin: "*", // Change to frontend domain in production
        methods: ["GET", "POST"],
      },
    });
    console.log("✅ Socket.io initialized");
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized");
    }
    return io;
  },
  closeSocket: () => {
    if (io) {
      io.close();
    }
  },
};
