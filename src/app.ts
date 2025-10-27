import express, { type Application, type Request, type Response } from 'express';
import authRoutes from './presentation/routes/auth.routes';
import userRoutes from './presentation/routes/users.routes';

class App {
	private readonly app: Application;

	constructor() {
		this.app = express();
		this.configureRoutes();
	}

	private configureRoutes() {
		this.app.get('/', (req: Request, res: Response) => {
			res.json({ status: 'ok' });
		});
		this.app.use('/api', authRoutes);
		this.app.use('/api', userRoutes);
	}

	get instance() {
		return this.app;
	}
}

export const createApp = () => new App().instance;

export default App;
