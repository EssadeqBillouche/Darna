import { Types } from 'mongoose';
import { Bien } from '../../business/entities/Bien';
import type { BienProps } from '../../business/types/Bien';
import { BienModel } from '../models/BienModel';

type BienDocument = BienProps & {
	_id: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
};

export default class BienRepository {
	public async create(entity: Bien): Promise<Bien> {
		const { id, ...payload } = entity.toPersistence();
		const created = await BienModel.create({
			...payload,
		});
		return this.mapDocument(created);
	}

	/**
	 * Find properties with optional filtering and pagination.
	 * filters: ownerId, type, status, minPrice, maxPrice, city
	 */
	public async findAll(options?: {
		page?: number;
		limit?: number;
		filters?: {
			ownerId?: string;
			type?: string;
			status?: string;
			minPrice?: number;
			maxPrice?: number;
			minArea?: number;
			maxArea?: number;
			city?: string;
			address?: string;
		};
		sort?: string; // 'date' | 'price_asc' | 'price_desc' | 'relevance'
		query?: string; // full text search string
	}): Promise<{ items: Bien[]; total: number }> {
		const page = options?.page && options.page > 0 ? options.page : 1;
		const limit = options?.limit && options.limit > 0 ? options.limit : 20;
		const skip = (page - 1) * limit;

		const q: any = {};
		const f = options?.filters;
		if (f) {
			if (f.ownerId) q.ownerId = f.ownerId;
			if (f.type) q.type = f.type;
			if (f.status) q.status = f.status;
			if (typeof f.minPrice === 'number' || typeof f.maxPrice === 'number') {
				q.price = {} as any;
				if (typeof f.minPrice === 'number') q.price.$gte = f.minPrice;
				if (typeof f.maxPrice === 'number') q.price.$lte = f.maxPrice;
			}
			if (f.city) q['location.city'] = f.city;
			if (typeof f.minArea === 'number' || typeof f.maxArea === 'number') {
				q.area = {} as any;
				if (typeof f.minArea === 'number') q.area.$gte = f.minArea;
				if (typeof f.maxArea === 'number') q.area.$lte = f.maxArea;
			}
			if (f.address) {
				// case-insensitive partial match on address
				q['location.address'] = { $regex: f.address, $options: 'i' };
			}
		}

		// full text search
		if (options?.query) {
			q.$text = { $search: options.query };
		}

		// compute sort
		let sortObj: any = { createdAt: -1 };
		if (options?.sort) {
			switch (options.sort) {
				case 'date':
					sortObj = { createdAt: -1 };
					break;
				case 'price_asc':
					sortObj = { price: 1 };
					break;
				case 'price_desc':
					sortObj = { price: -1 };
					break;
				case 'relevance':
					// relevance only available when using text search; otherwise fallback to date
					if (options?.query) sortObj = { score: { $meta: 'textScore' } };
					else sortObj = { createdAt: -1 };
					break;
				default:
					sortObj = { createdAt: -1 };
			}
		}

		// projection: include text score when doing text search
		const projection = options?.query ? { score: { $meta: 'textScore' } } : undefined;

		const [documents, total] = await Promise.all([
			BienModel.find(q, projection).sort(sortObj).skip(skip).limit(limit).exec(),
			BienModel.countDocuments(q).exec(),
		]);

		return { items: documents.map((doc) => this.mapDocument(doc)), total };
	}

	public async findByOwner(ownerId: string): Promise<Bien[]> {
		const documents = await BienModel
			.find({ ownerId })
			.sort({ createdAt: -1 });
		return documents.map((doc) => this.mapDocument(doc));
	}

	public async findById(id: string): Promise<Bien | null> {
		const document = await BienModel.findById(id);
		return document ? this.mapDocument(document) : null;
	}

	public async update(entity: Bien): Promise<Bien> {
		if (!entity.id) throw new Error('Cannot update a property without an identifier');

		const persistence = entity.toPersistence();
		const { id, createdAt, ...updatePayload } = persistence;

		const updated = await BienModel.findByIdAndUpdate(
			entity.id,
			updatePayload,
			{ new: true },
		);

		if (!updated) throw new Error('Property not found');
		return this.mapDocument(updated);
	}

	public async delete(id: string): Promise<void> {
		const deleted = await BienModel.findByIdAndDelete(id);
		if (!deleted) throw new Error('Property not found');
	}

	private mapDocument(document: { toObject(): BienDocument }): Bien {
		const { _id, ...rest } = document.toObject();
		return new Bien({
			...(rest as BienProps),
			id: _id.toString(),
		});
	}
}
