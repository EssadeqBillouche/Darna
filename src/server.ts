import 'dotenv/config';
import type { Application } from 'express';
import { createApp } from './app';
import { connectToDatabase, disconnectFromDatabase, isDatabaseConnected } from './infrastructure/config/db.config';

class Server {
	private readonly port: number;
	private readonly app: Application;

	constructor(app: Application = createApp(), port: number = Number(process.env.PORT ?? 3000)) {
		this.app = app;
		this.port = port;
	}

	async start() {
		try {
			await connectToDatabase();

			if(isDatabaseConnected()) {
				console.log('Database connected successfully!: ', isDatabaseConnected());
				
			} else {
				console.log('Database not work: ', disconnectFromDatabase());
			}
			this.app.listen(this.port, () => {
        
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
