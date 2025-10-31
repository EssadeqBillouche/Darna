import mongoose from 'mongoose';
import {
	BienProps,
	PropertyStatus,
	PropertyType,
} from '../../business/types/Bien';


const CoordinatesSchema = new mongoose.Schema({
	latitude: { type: Number, required: true },
	longitude: { type: Number, required: true },
}, { _id: false });

const LocationSchema = new mongoose.Schema({
	address: { type: String, required: true },
	city: { type: String, required: true },
	state: { type: String },
	postalCode: { type: String },
	coordinates: { type: CoordinatesSchema, default: undefined },
}, { _id: false });

const CharacteristicsSchema = new mongoose.Schema({
	roomNumber: { type: Number },
	bedRoom: { type: Number },
	toilet: { type: Number },
	levels: { type: Number },
	hasPool: { type: Boolean },
	hasGarden: { type: Boolean },
}, { _id: false });

const BienSchema = new mongoose.Schema<BienProps>({
	ownerId: { type: String, required: true, index: true },
	title: { type: String, required: true },
	description: { type: String },
	price: { type: Number, required: true },
	currency: { type: String, required: true, default: 'MAD' },
	type: { type: String, enum: Object.values(PropertyType), required: true },
	status: { type: String, enum: Object.values(PropertyStatus), default: PropertyStatus.DRAFT },
	location: { type: LocationSchema, required: true },
	characteristics: { type: CharacteristicsSchema, default: undefined },
	yearBuilt: { type: Number },
	area: { type: Number },
	media: { type: [String], default: [] },
}, { timestamps: true });

BienSchema.index({ status: 1, type: 1 });
BienSchema.index({ title: 'text', description: 'text' });

export const BienModel = mongoose.model('Bien', BienSchema);
