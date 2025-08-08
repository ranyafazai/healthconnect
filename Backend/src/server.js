// backend/src/server.js
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
import app from "./app.js";
import {prisma} from "./config/db.js";
// import registerChatSocket from "./sockets/chat.socket.js";
// import registerVideoCallSocket from "./sockets/videoCall.socket.js";
// import registerNotificationSocket from "./sockets/notification.socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Ensure cookies are parsed (authMiddleware reads req.cookies)
// app.use(cookieParser());

app.get('/:id', async (req, res) => {
  try {
    const doctorId = parseInt(req.params.id);

    const doctor = await prisma.doctorProfile.findUnique({
      where: {
        id: doctorId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        },
        photo: true,
        appointments: {
          include: {
            patient: {
              include: {
                user: {
                  select: {
                    email: true
                  }
                }
              }
            },
            recording: true,
            messages: true
          }
        },
        reviews: {
          include: {
            patient: {
              include: {
                user: {
                  select: {
                    email: true
                  }
                }
              }
            }
          }
        },
        certifications: {
          include: {
            file: true
          }
        }
      }
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ error: 'Failed to fetch doctor details' });
  }
});


server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
