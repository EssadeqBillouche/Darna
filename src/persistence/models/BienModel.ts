import mongoose, { Schema } from 'mongoose';
import { BienProps } from '../../business/types/Bien';

const coordinateSetter = (value?: number) => {
	if (value === undefined || value === null) return undefined;
	return Number(value.toFixed(6));
};

const nonNegativeNumberSetter = (value?: number) => {
	if (value === undefined || value === null) return undefined;
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed < 0) return undefined;
	return Number(parsed.toFixed(2));
};

const nonNegativeIntegerSetter = (value?: number) => {
	if (value === undefined || value === null) return undefined;
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed < 0) return undefined;
	return Math.floor(parsed);
};

const CoordinatesSchema = new Schema(
	{
		latitude: {
			type: Number,
			required: true,
			min: -90,
			max: 90,
			set: coordinateSetter,
		},
		longitude: {
			type: Number,
			required: true,
			min: -180,
			max: 180,
			set: coordinateSetter,
		},
	},
	{ _id: false },
);

const LocationSchema = new Schema(
	{
		addressLine1: { type: String, required: true, trim: true },
		addressLine2: { type: String, trim: true },
		city: { type: String, required: true, trim: true },
		state: { type: String, trim: true },
		postalCode: { type: String, required: true, trim: true },
		country: { type: String, required: true, trim: true },
		coordinates: { type: CoordinatesSchema, default: undefined },
	},
	{ _id: false },
);

const AreaSchema = new Schema(
	{
		total: { type: Number, required: true, min: 0 },
		habitable: { type: Number, min: 0 },
		land: { type: Number, min: 0 },
		unit: { type: String, enum: ['sqm', 'sqft'], default: 'sqm' },
	},
	{ _id: false },
);

const CharacteristicsSchema = new Schema(
	{
		rooms: { type: Number, min: 0 },
		bedrooms: { type: Number, min: 0 },
		bathrooms: { type: Number, min: 0 },
		toilets: { type: Number, min: 0 },
		suites: { type: Number, min: 0 },
		parkingSpots: { type: Number, min: 0 },
		balconies: { type: Number, min: 0 },
		levels: { type: Number, min: 0 },
		floorNumber: { type: Number, min: 0 },
		hasElevator: { type: Boolean },
		hasGarden: { type: Boolean },
		hasTerrace: { type: Boolean },
		hasPool: { type: Boolean },
		heatingType: {
			type: String,
			enum: ['none', 'electric', 'gas', 'oil', 'solar'],
		},
		coolingType: {
			type: String,
			enum: ['none', 'central', 'split', 'evaporative'],
		},
		orientation: {
			type: String,
			enum: [
				'north',
				'south',
				'east',
				'west',
				'north-east',
				'north-west',
				'south-east',
				'south-west',
			],
		},
		yearBuilt: { type: Number, min: 0 },
		renovationYear: { type: Number, min: 0 },
		energyClass: { type: String, trim: true },
		area: { type: AreaSchema, default: undefined },
	},
	{ _id: false },
);

const EnergyDiagnosticSchema = new Schema(
	{
		rating: { type: String, enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
		consumption: { type: Number, min: 0, set: nonNegativeNumberSetter },
		emissionRating: { type: String, enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
		emissions: { type: Number, min: 0, set: nonNegativeNumberSetter },
		inspectionDate: { type: Date },
		validUntil: { type: Date },
		reference: { type: String, trim: true },
	},
	{ _id: false },
);

const RulesSchema = new Schema(
	{
		furnished: { type: Boolean },
		petsAllowed: { type: Boolean },
		smokingAllowed: { type: Boolean },
		childrenAllowed: { type: Boolean },
		eventsAllowed: { type: Boolean },
		minimumLeaseTermMonths: {
			type: Number,
			min: 0,
			set: nonNegativeIntegerSetter,
		},
		maximumOccupants: {
			type: Number,
			min: 0,
			set: nonNegativeIntegerSetter,
		},
		customRules: {
			type: [String],
			default: undefined,
			set: (values: string[]) => normalizeStringArray(values),
		},
	},
	{ _id: false },
);

const BienSchema = new Schema<BienProps>(
	{
		ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true } as any,
		title: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
		price: { type: Number, required: true, min: 0 },
		currency: { type: String, required: true, uppercase: true, trim: true },
		type: {
			type: String,
			enum: ['apartment', 'house', 'studio', 'villa', 'land', 'commercial', 'other'],
			required: true,
		},
		status: {
			type: String,
			enum: ['draft', 'published', 'archived'],
			default: 'draft',
		},
		location: { type: LocationSchema, required: true },
		characteristics: { type: CharacteristicsSchema, default: {} },
		energyDiagnostic: { type: EnergyDiagnosticSchema, default: undefined },
		rules: { type: RulesSchema, default: undefined },
		amenities: {
			type: [String],
			default: [],
			set: (values: string[]) => normalizeStringArray(values),
		},
		media: {
			type: [String],
			default: [],
			set: (values: string[]) => normalizeStringArray(values),
		},
		tags: {
			type: [String],
			default: [],
			set: (values: string[]) => normalizeStringArray(values),
		},
	},
	{
		timestamps: true,
	},
);

BienSchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });

const normalizeStringArray = (values?: string[]): string[] => {
	if (!values || values.length === 0) return [];
	return values
		.map((value) => value.trim())
		.filter((value, index, self) => value.length > 0 && self.indexOf(value) === index);
};

export const BienModel = mongoose.models.Bien || mongoose.model<BienProps>('Bien', BienSchema);
