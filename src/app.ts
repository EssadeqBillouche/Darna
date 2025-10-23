import express, { type Application, type Request, type Response } from 'express';
import authRoutes from './presentation/routes/auth.routes';

class App {
	private readonly app: Application;

	constructor() {
		this.app = express();
		this.configureMiddleware();
		this.configureRoutes();
	}

	private configureMiddleware() {
		this.app.use(express.json());
	}

	private configureRoutes() {
		this.app.get('/', (req: Request, res: Response) => {
			res.json({ status: 'ok' });
		});
		this.app.use('/api', authRoutes);
	}

	get instance() {
		return this.app;
	}
}

export const createApp = () => new App().instance;

export default App;
