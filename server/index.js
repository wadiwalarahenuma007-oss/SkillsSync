// ── MUST be first — loads .env before any other require reads process.env ──
require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const skillRoutes = require("./routes/skillRoutes");
const adminRoutes = require("./routes/adminRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const requestRoutes = require("./routes/requestRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// db + startup checks
const connectDB = require("./config/db");
const { verifyMailTransporter } = require("./controllers/contactController");

connectDB().then(() => {
  // Run startup migrations after DB is ready
  require("./utils/migrateSkills")().catch(console.error);
  require("./utils/seedTests")().catch(console.error);

  // Verify Gmail SMTP credentials at startup — result logged, no crash on failure
  verifyMailTransporter();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cookieParser());

app.use(
  cors({
    origin: "https://skills-sync-psi.vercel.app",
    credentials: true,
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/admin", adminRoutes);

// Mentor discovery + mentor request management
app.use("/api/mentors", mentorRoutes);
// same router also handles /api/mentor/apply, /api/mentor/requests/*
app.use("/api/mentor", mentorRoutes);

// Student request routes
app.use("/api/requests", requestRoutes);

// Notification routes
app.use("/api/notifications", notificationRoutes);

const chatRoutes = require("./routes/chatRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const walletRoutes = require("./routes/walletRoutes");
const testRoutes = require("./routes/testRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/reviews", reviewRoutes);

// Public routes — no auth required
const publicRoutes = require("./routes/publicRoutes");
const contactRoutes = require("./routes/contactRoutes");
app.use("/api/public", publicRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => {
  res.send("hello");
});



const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://skills-sync-psi.vercel.app",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.join(userId);
  });
  socket.on("sendMessage", ({ conversationId, message, recipientId }) => {
    // Emit to recipient's room
    io.to(recipientId).emit("newMessage", { conversationId, message });
  });
  socket.on("disconnect", () => {});
});

app.set("io", io);

// Change app.listen to server.listen
// server.listen(3000, () => console.log('Server running on port 3000'));

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
