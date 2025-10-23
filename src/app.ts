import express, { type Application, type Request, type Response } from 'express';

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
	}

	get instance() {
		return this.app;
	}
}

export const createApp = () => new App().instance;

export default App;
