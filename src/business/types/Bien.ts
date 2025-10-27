export type PropertyType =
	| 'apartment'
	| 'house'
	| 'studio'
	| 'villa'
	| 'land'
	| 'commercial'
	| 'other';

export type PropertyStatus = 'draft' | 'published' | 'archived';

export type AreaUnit = 'sqm' | 'sqft';

export interface PropertyArea {
	total: number;
	habitable?: number;
	land?: number;
	unit: AreaUnit;
}

export interface PropertyCharacteristics {
	rooms?: number;
	bedrooms?: number;
	bathrooms?: number;
	toilets?: number;
	suites?: number;
	parkingSpots?: number;
	balconies?: number;
	levels?: number;
	floorNumber?: number;
	hasElevator?: boolean;
	hasGarden?: boolean;
	hasTerrace?: boolean;
	hasPool?: boolean;
	heatingType?: 'none' | 'electric' | 'gas' | 'oil' | 'solar';
	coolingType?: 'none' | 'central' | 'split' | 'evaporative';
	orientation?:
		| 'north'
		| 'south'
		| 'east'
		| 'west'
		| 'north-east'
		| 'north-west'
		| 'south-east'
		| 'south-west';
	yearBuilt?: number;
	renovationYear?: number;
	energyClass?: string;
	area?: PropertyArea;
}

export interface PropertyLocationCoordinates {
	latitude?: number;
	longitude?: number;
}

export interface PropertyLocation {
	addressLine1: string;
	addressLine2?: string;
	city: string;
	state?: string;
	postalCode: string;
	country: string;
	coordinates?: PropertyLocationCoordinates;
}

export interface BienProps {
	id?: string;
	ownerId: string;
	title: string;
	description?: string;
	price: number;
	currency?: string;
	type: PropertyType;
	status?: PropertyStatus;
	location: PropertyLocation;
	characteristics?: PropertyCharacteristics;
	amenities?: string[];
	media?: string[];
	tags?: string[];
	createdAt?: Date;
	updatedAt?: Date;
}

export interface BienDTO {
	id?: string;
	ownerId: string;
	title: string;
	description?: string;
	price: number;
	currency: string;
	type: PropertyType;
	status: PropertyStatus;
	location: PropertyLocation;
	characteristics: PropertyCharacteristics;
	amenities: string[];
	media: string[];
	tags: string[];
	createdAt: Date;
	updatedAt: Date;
}

export interface BienUpdatePayload {
	title?: string;
	description?: string;
	price?: number;
	currency?: string;
	status?: PropertyStatus;
	location?: PropertyLocation;
	amenities?: string[];
	media?: string[];
	tags?: string[];
	characteristics?: PropertyCharacteristics;
}

export interface BienCreationPayload {
	ownerId: string;
	title: string;
	description?: string;
	price: number;
	currency?: string;
	type: PropertyType;
	status?: PropertyStatus;
	location: PropertyLocation;
	characteristics?: PropertyCharacteristics;
	amenities?: string[];
	media?: string[];
	tags?: string[];
}
