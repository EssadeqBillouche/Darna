import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import userRoutes from "./presentation/routes/users.routes";
import bienRoutes from "./presentation/routes/biens.routes";

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
    this.app.use("/api-v1/user", userRoutes);
    this.app.use("/api-v1/biens", bienRoutes);
	}

	get instance() {
		return this.app;
	}
}

export const createApp = () => new App().instance;
