import { Server } from "socket.io";
import { createServer } from "http";
import { BASE_URL } from "./constants"

const server = createServer();

const io = new Server(server, {
    cors: {
        origin: BASE_URL,
        methods: ["GET", "POST"],
        allowedHeaders: ["*"],
    },
    transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
});

export default io;