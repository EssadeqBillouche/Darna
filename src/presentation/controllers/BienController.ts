import { Request, Response } from 'express';
import BienService, { BienListFilters } from '../../business/services/BienService';
import { PropertyStatus } from '../../business/types/Bien';

export class BienController {
	constructor(private readonly bienService: BienService) {}

	public create = async (req: Request, res: Response): Promise<Response> => {
		try {
			const property = await this.bienService.createBien(req.body);
			return res.status(201).json({ property });
		} catch (error) {
			return this.handleError(res, error);
		}
	};

	public findAll = async (req: Request, res: Response): Promise<Response> => {
		try {
			const filters = this.parseListFilters(req);
			const properties = await this.bienService.listBiens(filters);
			return res.status(200).json({ properties, count: properties.length });
		} catch (error) {
			return this.handleError(res, error);
		}
	};

	public findById = async (req: Request, res: Response): Promise<Response> => {
		try {
			const property = await this.bienService.getBienById(req.params.id);
			return res.status(200).json({ property });
		} catch (error) {
			return this.handleError(res, error);
		}
	};

	public update = async (req: Request, res: Response): Promise<Response> => {
		try {
			const property = await this.bienService.updateBien(req.params.id, req.body);
			return res.status(200).json({ property });
		} catch (error) {
			return this.handleError(res, error);
		}
	};

	public remove = async (req: Request, res: Response): Promise<Response> => {
		try {
			await this.bienService.deleteBien(req.params.id);
			return res.status(204).send();
		} catch (error) {
			return this.handleError(res, error);
		}
	};

	private parseListFilters(req: Request): BienListFilters {
		const filters: BienListFilters = {};

		if (typeof req.query.ownerId === 'string') {
			filters.ownerId = req.query.ownerId;
		}

		if (this.isValidStatus(req.query.status)) {
			filters.status = req.query.status;
		}

		if (typeof req.query.city === 'string') {
			filters.city = req.query.city;
		}

		const limit = this.parseNumber(req.query.limit);
		if (limit !== undefined) filters.limit = limit;

		const offset = this.parseNumber(req.query.offset);
		if (offset !== undefined) filters.offset = offset;

		return filters;
	}

	private parseNumber(value: unknown): number | undefined {
		if (typeof value !== 'string') return undefined;
		const parsed = Number(value);
		return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
	}

	private isValidStatus(value: unknown): value is PropertyStatus {
		if (typeof value !== 'string') return false;
		return ['draft', 'published', 'archived'].includes(value);
	}

	private handleError(res: Response, error: unknown): Response {
		const message = error instanceof Error ? error.message : 'Unexpected error';
		const status = message.toLowerCase().includes('not found') ? 404 : 400;
		return res.status(status).json({ error: message });
	}
}

export default BienController;
