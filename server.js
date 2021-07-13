require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = process.env.PORT || 8000;
const cookieParser = require("cookie-parser");
var corsOptions = {
  origin: PORT,
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser support
};
const authRoutes = require("./routes/authRoutes");
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(authRoutes);

const users = {};

const socketToRoom = {};

io.on("connection", (socket) => {
  socket.on("join room", (roomID) => {
    if (users[roomID]) {
      const length = users[roomID].length;
      if (length === 4) {
        socket.emit("room full");
        return;
      }
      users[roomID].push(socket.id);
    } else {
      users[roomID] = [socket.id];
    }
    socketToRoom[socket.id] = roomID;
    const usersInThisRoom = users[roomID].filter((id) => id !== socket.id);

    socket.emit("all users", usersInThisRoom);
  });

  socket.on("sending signal", (payload) => {
    io.to(payload.userToSignal).emit("user joined", {
      signal: payload.signal,
      callerID: payload.callerID,
    });
  });

  socket.on("returning signal", (payload) => {
    io.to(payload.callerID).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.emit("your id", socket.id);
  socket.on("send message", (body) => {
    io.emit("message", body);
  });

  socket.on("disconnect", () => {
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    if (room) {
      room = room.filter((id) => id !== socket.id);
      users[roomID] = room;
    }
    socket.broadcast.emit("user left", socket.id);
  });
});
const mongoDB =
  "mongodb+srv://Avipriya:Avi123@cluster0.kkpyp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose
  .connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connected"))
  .catch((err) => console.log(err));
const { addUser, getUser, removeUser } = require("./helper");
const Message = require("./models/Message");

const Room = require("./models/Room");
app.get("/set-cookies", (req, res) => {
  res.cookie("username", "Tony");
  res.cookie("isAuthenticated", true, { maxAge: 24 * 60 * 60 * 1000 });
  res.send("cookies are set");
});
app.get("/get-cookies", (req, res) => {
  const cookies = req.cookies;
  console.log(cookies);
  res.json(cookies);
});

io.on("connection", (socket) => {
  console.log(socket.id);
  Room.find().then((result) => {
    socket.emit("output-rooms", result);
  });
  socket.on("create-room", (name, description) => {
    // console.log('Then room name received is ', name)
    const room = new Room({ name: name, description: description });
    room.save().then((result) => {
      io.emit("room-created", result);
    });
  });
  socket.on("join", ({ name, room_id, user_id }) => {
    const { error, user } = addUser({
      socket_id: socket.id,
      name,
      room_id,
      user_id,
    });
    socket.join(room_id);
    if (error) {
      console.log("join error", error);
    } else {
      console.log("join user", user);
    }
  });
  socket.on("sendMessage", (message, room_id, callback) => {
    const user = getUser(socket.id);
    const msgToStore = {
      name: user.name,
      user_id: user.user_id,
      room_id,
      text: message,
    };
    console.log("message", msgToStore);
    const msg = new Message(msgToStore);
    msg.save().then((result) => {
      io.to(room_id).emit("message", result);
      callback();
    });
  });
  socket.on("get-messages-history", (room_id) => {
    Message.find({ room_id }).then((result) => {
      socket.emit("output-messages", result);
    });
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
  });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}
server.listen(PORT, () => console.log("server is running on port 8000"));
