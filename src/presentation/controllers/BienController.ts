import { Request, Response } from 'express';
import { BienService } from '../../business/services/BienService';

const NOT_FOUND_MESSAGE = 'Property not found';

export class BienController {
	constructor(private readonly service: BienService) {}

	public async create(req: Request, res: Response): Promise<Response> {
		try {
			const bien = await this.service.create(req.body);
			return res.status(201).json({ bien });
		} catch (error) {
			return this.handleError(res, error);
		}
	}

	public async list(_req: Request, res: Response): Promise<Response> {
		try {
			const biens = await this.service.list();
			return res.status(200).json({ biens });
		} catch (error) {
			return this.handleError(res, error);
		}
	}

	public async getById(req: Request, res: Response): Promise<Response> {
		try {
			const bien = await this.service.getById(req.params.id);
			return res.status(200).json({ bien });
		} catch (error) {
			return this.handleError(res, error);
		}
	}

	public async update(req: Request, res: Response): Promise<Response> {
		try {
			const bien = await this.service.update(req.params.id, req.body);
			return res.status(200).json({ bien });
		} catch (error) {
			return this.handleError(res, error);
		}
	}

	public async delete(req: Request, res: Response): Promise<Response> {
		try {
			await this.service.delete(req.params.id);
			return res.status(204).send();
		} catch (error) {
			return this.handleError(res, error);
		}
	}

	private handleError(res: Response, error: unknown): Response {
		const message = error instanceof Error ? error.message : 'Unexpected error';
		const status = message === NOT_FOUND_MESSAGE ? 404 : 400;
		return res.status(status).json({ error: message });
	}
}
