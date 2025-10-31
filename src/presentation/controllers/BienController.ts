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
			const q = _req.query;
			const page = q.page ? parseInt(String(q.page), 10) : undefined;
			const limit = q.limit ? parseInt(String(q.limit), 10) : undefined;
			const filters: any = {};
			if (q.ownerId) filters.ownerId = String(q.ownerId);
			if (q.type) filters.type = String(q.type);
			if (q.status) filters.status = String(q.status);
			if (q.minPrice) filters.minPrice = Number(q.minPrice);
			if (q.maxPrice) filters.maxPrice = Number(q.maxPrice);
			if (q.city) filters.city = String(q.city);
			const sort = q.sort ? String(q.sort) : undefined;
			const query = q.q ? String(q.q) : undefined; // full text search string

			const result = await this.service.list({ page, limit, filters, sort, query });
			return res.status(200).json(result);
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
