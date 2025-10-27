import { Bien } from '../entities/Bien';
import { BienCreationPayload, BienDTO, BienUpdatePayload, PropertyStatus } from '../types/Bien';
import BienRepository, { BienQuery } from '../../persistence/repositories/BienRepository';

export interface BienListFilters {
	ownerId?: string;
	status?: PropertyStatus;
	city?: string;
	limit?: number;
	offset?: number;
}

export class BienService {
	constructor(private readonly repository: BienRepository) {}

	public async createBien(payload: BienCreationPayload): Promise<BienDTO> {
		const entity = Bien.create(payload);
		const saved = await this.repository.create(entity);
		return saved.toJSON();
	}

	public async getBienById(id: string): Promise<BienDTO> {
		const bien = await this.repository.findById(id);
		if (!bien) throw new Error('Property not found');
		return bien.toJSON();
	}

	public async listBiens(filters: BienListFilters = {}): Promise<BienDTO[]> {
		const query: BienQuery = {
			ownerId: filters.ownerId,
			status: filters.status,
			city: filters.city,
			limit: filters.limit,
			offset: filters.offset,
		};

		const biens = await this.repository.findAll(query);
		return biens.map((bien) => bien.toJSON());
	}

	public async updateBien(id: string, payload: BienUpdatePayload): Promise<BienDTO> {
		const bien = await this.repository.findById(id);
		if (!bien) throw new Error('Property not found');

		const previousUpdatedAt = bien.updatedAt ? bien.updatedAt.getTime() : 0;
		bien.update(payload);

		if (bien.updatedAt && bien.updatedAt.getTime() === previousUpdatedAt) {
			return bien.toJSON();
		}

		const updated = await this.repository.update(bien);
		return updated.toJSON();
	}

	public async deleteBien(id: string): Promise<void> {
		const deleted = await this.repository.delete(id);
		if (!deleted) throw new Error('Property not found');
	}
}

export default BienService;
