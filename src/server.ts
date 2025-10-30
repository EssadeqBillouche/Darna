import "dotenv/config";
import http from "http";
import type { Server as HttpServer } from "http";
import type { Application } from "express";
import { createApp } from "./app";
import { connectToDatabase, disconnectFromDatabase, isDatabaseConnected } from "./infrastructure/config/db.config";
import SocketServer from "./infrastructure/messaging/SocketServer";



class Server {
	private readonly port: number;
	private readonly app: Application;
	private readonly httpServer: HttpServer;;

	constructor(app: Application = createApp(), port: number = Number(process.env.PORT ?? 3000)) {
		this.app = app;
		this.port = port;
		this.httpServer= http.createServer(this.app)
	}

	async start() {
		try {
			await connectToDatabase(); // data base connection 


			if(isDatabaseConnected()) {
				console.log('Database connected successfully!: ', isDatabaseConnected());
				
			} else {
				console.log('Database not work: ', disconnectFromDatabase());
			}
			new SocketServer(this.httpServer) // socket io



			this.httpServer.listen(this.port, () => {
        
				console.log(`Server listening on port ${this.port}`);
				console.log(`http://localhost:${this.port}`);
			});
		} catch (error) {
			console.error('Failed to start server', error);
			process.exit(1);
		}
	}
}

const server = new Server();

void server.start();
