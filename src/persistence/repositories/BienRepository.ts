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

	public async findAll(): Promise<Bien[]> {
		const documents = await BienModel.find().sort({ createdAt: -1 });
		return documents.map((doc) => this.mapDocument(doc));
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
