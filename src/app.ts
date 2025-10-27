import express, { type Application, type Request, type Response } from 'express';
import userRoutes from './presentation/routes/users.routes';

class App {
	private readonly app: Application;

	constructor() {
		this.app = express();
		this.configureRoutes();
	}

	private configureRoutes() {
		this.app.use('/api-v1/user', userRoutes);
	}

	get instance() {
		return this.app;
	}
}

export const createApp = () => new App().instance;
