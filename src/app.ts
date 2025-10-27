import express, { type Application, type Request, type Response } from 'express';
import authRoutes from './presentation/routes/auth.routes';
import userRoutes from './presentation/routes/users.routes';
import bienRoutes from './presentation/routes/biens.routes';

class App {
	private readonly app: Application;

	constructor() {
		this.app = express();
		this.configureMiddlewares();
		this.configureRoutes();
	}

	private configureMiddlewares() {
		this.app.use(express.json());
		this.app.use(express.urlencoded({ extended: true }));
	}

	private configureRoutes() {
		this.app.get('/', (req: Request, res: Response) => {
			res.json({ status: 'ok' });
		});
		this.app.use('/api', authRoutes);
		this.app.use('/api', userRoutes);
		this.app.use('/biens', bienRoutes);
	}

	get instance() {
		return this.app;
	}
}

export const createApp = () => new App().instance;

export default App;
