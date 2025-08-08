// backend/src/server.js
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import app from "./app.js";

// import registerChatSocket from "./sockets/chat.socket.js";
// import registerVideoCallSocket from "./sockets/videoCall.socket.js";
// import registerNotificationSocket from "./sockets/notification.socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Ensure cookies are parsed (authMiddleware reads req.cookies)
app.use(cookieParser());

// const io = new SocketIOServer(server, {
//   cors: {
//     origin: "*", 
//     methods: ["GET", "POST"]
//   }
// });

// io.on("connection", (socket) => {
//   console.log(`Socket connected: ${socket.id}`);
//   // registerChatSocket(io, socket);
//   // registerVideoCallSocket(io, socket);
//   // registerNotificationSocket(io, socket);
// });

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
