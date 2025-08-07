import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
// import authRoutes from "./routes/auth.routes.js";
// import userRoutes from "./routes/user.routes.js";
// import doctorRoutes from "./routes/doctor.routes.js";
// import patientRoutes from "./routes/patient.routes.js";
// import appointmentRoutes from "./routes/appointment.routes.js";
// import messageRoutes from "./routes/message.routes.js";
// import reviewRoutes from "./routes/review.routes.js";
// import notificationRoutes from "./routes/notification.routes.js";
// import medicalRecordRoutes from "./routes/medicalRecord.routes.js";
// import fileRoutes from "./routes/file.routes.js";
// import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();
export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/doctors", doctorRoutes);
// app.use("/api/patients", patientRoutes);
// app.use("/api/appointments", appointmentRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/reviews", reviewRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/medical-records", medicalRecordRoutes);
// app.use("/api/files", fileRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// app.use(errorHandler);

export default app;
