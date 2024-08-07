const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const socket = require("socket.io");
const { rootRouter } = require("./app/routes");

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URL =
  "mongodb+srv://admin:B9zO7wFqxJux7CyY@cluster0.kpybdzc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const port = 5000;

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Success!");
  });

app.use("/api/v1", rootRouter);

const server = app.listen(port || process.env.PORT, () => {
  console.log(`Server running on port ${port}!`);
});

const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });
  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-receive", data.message);
    }
  });
});
