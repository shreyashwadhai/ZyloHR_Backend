const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const http = require("http");
const socketIo = require("socket.io");

const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const verifyRoute = require("./routers/verify");
const Message = require("./models/message.model");


// Redis connection 
const session = require("express-session");
// const RedisStore = require("connect-redis").RedisStore;
const connectRedis = require("connect-redis");
const RedisStore = connectRedis(session);

// const client = require("./config/redisClient");

const app = express();
const server = http.createServer(app);

// Redis session
// app.use(
//   session({
//     store: new RedisStore({
//       client,
//     }),
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: false,   // true if using https
//       httpOnly: true,
//       maxAge: 1000 * 60 * 10, // 10 minutes
//     },
//   })
// );

// Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
})

const connectedUsers = new Map();

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Handle user registration
  socket.on("register", (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} connected with socket ID: ${socket.id}`);
  });



  // Handle private messages
  socket.io("privateMessage", async (data) => {
    try {
      const { senderId, receiverId, content, senderName, receiverName } = data;

      const message = await saveMessageToDB({
        sender: senderId,
        receiver: receiverId,
        senderName,
        receiverName,
        content
      });
      // const savedMessage = await message.save();

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name avatar role')
        .populate('receiver', 'name avatar role');


      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", populatedMessage);
      }

      socket.emit("messageSent", populatedMessage);
      console.log(`Message sent from ${senderId} to ${receiverId}: ${content}`);
    }
    catch (error) {
      console.error("Error handling private message:", error);
    }
  });

  // Handle typing indicators
  socket.on("typing", (data) => {
    const { receiverId, senderId, isTyping } = data;
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", {
        senderId,
        isTyping
      });
    }
  });

  //Handle Disconnect
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);

    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });

});

app.set("io", io);

//  CORS
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};
app.use(cors(corsOptions));

//  Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


//  Default route
app.get("/", (req, res) => {
  res.send("Server Started Sucessfully !");
});


// app.use("/api", verifyRoute);

//  Routes
const authRouter = require("./routers/auth.router");
const apiRouter = require("./routers/api.router");

app.use("/auth", authRouter);
app.use("/api", apiRouter);

const PORT = process.env.PORT || 5000;

//  Server Start
app.listen(PORT, '0.0.0.0', () => {
  connectDB();
  console.log(`🚀 Server is ruuning up ! PORT : ${PORT}`);
});


// Save message to DB
async function saveMessageToDB({ sender, receiver, senderName, receiverName, content }) {
  try {
    const message = new Message({
      _id: Date.now().toString(),
      sender,
      receiver,
      senderName,
      receiverName,
      content,
      timestamp: new Date(),
    });
    return await message.save();
  } catch (error) {
    console.error("Error saving message to DB:", error);
    throw error;
  }
}