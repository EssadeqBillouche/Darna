import { Bien } from '../entities/Bien';
import type {
	BienCreationPayload,
	BienDTO,
	BienUpdatePayload,
} from '../types/Bien';
import BienRepository from '../../persistence/repositories/BienRepository';

export class BienService {
	constructor(private readonly repository: BienRepository) {}

	public async create(payload: BienCreationPayload): Promise<BienDTO> {
		const entity = Bien.create(payload);
		const saved = await this.repository.create(entity);
		return saved.toJSON();
	}

	/**
	 * List properties with optional pagination and filters.
	 * Returns DTOs and meta information.
	 */
	public async list(options?: {
		page?: number;
		limit?: number;
		filters?: {
			ownerId?: string;
			type?: string;
			status?: string;
			minPrice?: number;
			maxPrice?: number;
			city?: string;
		};
	}): Promise<{ items: BienDTO[]; total: number; page: number; limit: number }> {
		const page = options?.page && options.page > 0 ? options.page : 1;
		const limit = options?.limit && options.limit > 0 ? options.limit : 20;
		const { items, total } = await this.repository.findAll({ page, limit, filters: options?.filters });
		return { items: items.map((b) => b.toJSON()), total, page, limit };
	}

	public async getById(id: string): Promise<BienDTO> {
		const bien = await this.repository.findById(id);
		if (!bien) throw new Error('Property not found');
		return bien.toJSON();
	}

	public async update(id: string, payload: BienUpdatePayload): Promise<BienDTO> {
		const bien = await this.repository.findById(id);
		if (!bien) throw new Error('Property not found');

		bien.update(payload);
		const updated = await this.repository.update(bien);
		return updated.toJSON();
	}

	public async delete(id: string): Promise<void> {
		await this.repository.delete(id);
	}
}
