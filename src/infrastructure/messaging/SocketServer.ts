import { Server, Socket } from "socket.io";
import type { Server as HttpServer } from "http";

interface JoinPayload {
    propertyId: string;
}

interface MessagePayload {
    propertyId: string;
    message: string;
    sender: string;
}

export default class SocketServer {
    private io: Server;

    constructor(httpServer: HttpServer) {
        this.io = new Server(httpServer, {
            cors: { origin: "*" }
        });

        this.io.on("connection", (socket: Socket) => {
            console.log("User connected:", socket.id);

            socket.on("join", ({ propertyId }: JoinPayload) => {
                socket.join(`prop-${propertyId}`);
                console.log(`${socket.id} joined prop-${propertyId}`);
            });

            socket.on("message", (data: MessagePayload) => {
                const { propertyId, message, sender } = data;
                const payload = { message, sender, time: new Date().toISOString() };
                this.io.to(`prop-${propertyId}`).emit("message", payload);
            });

            socket.on("leave", ({ propertyId }: JoinPayload) => {
                socket.leave(`prop-${propertyId}`);
            });

            socket.on("disconnect", () => {
                console.log("User disconnected:", socket.id);
            });
        });
    }
}