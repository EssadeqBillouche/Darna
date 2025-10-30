export enum PropertyType {
	APARTMENT = 'apartment',
	HOUSE = 'house',
	VILLA = 'villa',
	LAND = 'land',
}

export enum PropertyStatus {
	DRAFT = 'draft',
	PUBLISHED = 'published',
	ARCHIVED = 'archived',
}

export interface PropertyLocationCoordinates {
	latitude: number;
	longitude: number;
}

export interface PropertyLocation {
	address: string;
	city: string;
	state?: string;
	postalCode?: string;
	coordinates?: PropertyLocationCoordinates;
}

export interface PropertyLocationUpdate {
	address?: string;
	city?: string;
	state?: string | null;
	postalCode?: string | null;
	coordinates?: PropertyLocationCoordinates | null;
}

export interface PropertyCharacteristics {
	roomNumber?: number;
	bedRoom?: number;
	toilet?: number;
	levels?: number;
	hasPool?: boolean;
	hasGarden?: boolean;
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
	yearBuilt?: number;
	area?: number;
	media?: string[];
}

export interface BienUpdatePayload {
	title?: string;
	description?: string | null;
	price?: number;
	currency?: string;
	status?: PropertyStatus;
	location?: PropertyLocationUpdate;
	characteristics?: PropertyCharacteristics;
	yearBuilt?: number | null;
	area?: number | null;
	media?: string[];
}

export interface BienProps extends BienCreationPayload {
	id?: string;
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
	yearBuilt?: number;
	area?: number;
	media: string[];
	createdAt: Date;
	updatedAt: Date;
}
