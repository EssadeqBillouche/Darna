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

	public async list(): Promise<BienDTO[]> {
		const biens = await this.repository.findAll();
		return biens.map((bien) => bien.toJSON());
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
