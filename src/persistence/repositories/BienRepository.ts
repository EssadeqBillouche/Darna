import { Types } from 'mongoose';
import { BienModel } from '../models/BienModel';
import { Bien } from '../../business/entities/Bien';
import { BienProps, PropertyStatus } from '../../business/types/Bien';

export interface BienQuery {
	ownerId?: string;
	status?: PropertyStatus;
	city?: string;
	limit?: number;
	offset?: number;
}

class BienRepository {
	public async create(bien: Bien): Promise<Bien> {
		const persistence = bien.toPersistence();
		const ownerId = this.mapToObjectId(persistence.ownerId) ?? persistence.ownerId;
		const created = await BienModel.create({
			...persistence,
			ownerId,
		});

		return this.toEntity(created);
	}

	public async findById(id: string): Promise<Bien | null> {
		if (!Types.ObjectId.isValid(id)) return null;

		const doc = await BienModel.findById(id).lean();
		if (!doc) return null;

		return this.toEntity(doc);
	}

	public async findAll(query: BienQuery = {}): Promise<Bien[]> {
	const filter: Record<string, unknown> = {};

		if (query.ownerId) {
			filter.ownerId = this.mapToObjectId(query.ownerId) ?? query.ownerId;
		}

		if (query.status) {
			filter.status = query.status;
		}

		if (query.city) {
			filter['location.city'] = query.city;
		}

		const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 50;
		const offset = query.offset && query.offset > 0 ? query.offset : 0;

		const docs = await BienModel.find(filter)
			.sort({ createdAt: -1 })
			.skip(offset)
			.limit(limit)
			.lean();

		return docs.map((doc) => this.toEntity(doc));
	}

	public async update(bien: Bien): Promise<Bien> {
		if (!bien.id) throw new Error('Cannot update property without identifier');

		const persistence = bien.toPersistence();
		const ownerId = this.mapToObjectId(persistence.ownerId) ?? persistence.ownerId;
		const updated = await BienModel.findByIdAndUpdate(
			bien.id,
			{
				...persistence,
				ownerId,
			},
			{ new: true, runValidators: true },
		).lean();

		if (!updated) throw new Error('Property not found');

		return this.toEntity(updated);
	}

	public async delete(id: string): Promise<boolean> {
		if (!Types.ObjectId.isValid(id)) return false;
		const result = await BienModel.findByIdAndDelete(id).lean();
		return Boolean(result);
	}

	private mapToObjectId(value: string | undefined) {
		if (!value) return undefined;
		return Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : undefined;
	}

	private toEntity(input: any): Bien {
		const plain = this.toPlainObject(input);
		const props: BienProps = {
			...plain,
			id: plain._id ? String(plain._id) : plain.id,
			ownerId: this.normalizeOwnerId(plain.ownerId),
			createdAt: this.toDate(plain.createdAt),
			updatedAt: this.toDate(plain.updatedAt),
		};

		delete (props as any)._id;
		delete (props as any).__v;

		return new Bien(props);
	}

	private toPlainObject(input: any): any {
		if (!input) return input;
		if (typeof input.toObject === 'function') {
			return input.toObject({ depopulate: true });
		}
		return { ...input };
	}

	private normalizeOwnerId(value: any): string {
		if (!value) return '';
		if (typeof value === 'string') return value;
		if (value instanceof Types.ObjectId) return value.toString();
		if (value._id) return String(value._id);
		return String(value);
	}

	private toDate(value: any): Date | undefined {
		if (!value) return undefined;
		if (value instanceof Date) return value;
		const date = new Date(value);
		return Number.isNaN(date.getTime()) ? undefined : date;
	}
}

export default BienRepository;
