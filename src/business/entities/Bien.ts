import {
	BienProps,
	BienDTO,
	BienUpdatePayload,
	BienCreationPayload,
	PropertyCharacteristics,
	PropertyLocation,
	PropertyLocationCoordinates,
	PropertyLocationUpdate,
	PropertyStatus,
	PropertyType,
} from '../types/Bien';

const DEFAULT_CURRENCY = 'MAD';
const DEFAULT_STATUS: PropertyStatus = 'draft';

const cloneCharacteristics = (source?: PropertyCharacteristics): PropertyCharacteristics => {
	if (!source) return {};
	const clone: PropertyCharacteristics = { ...source };
	if (source.area) {
		clone.area = { ...source.area };
	}
	return clone;
};

const COORDINATE_PRECISION = 6;

const normalizeStringArray = (values?: string[]): string[] => {
	if (!values || values.length === 0) return [];
	return values
		.map((value) => value.trim())
		.filter((value, index, self) => value.length > 0 && self.indexOf(value) === index);
};

const ensureRequiredString = (value: string | undefined, field: string): string => {
	const trimmed = value?.trim();
	if (!trimmed) throw new Error(`${field} is required`);
	return trimmed;
};

const roundCoordinate = (value: number): number => {
	const factor = 10 ** COORDINATE_PRECISION;
	return Math.round(value * factor) / factor;
};

const normalizeCoordinates = (
	coordinates?: PropertyLocationCoordinates | null,
): PropertyLocationCoordinates | undefined => {
	if (coordinates === null || coordinates === undefined) return undefined;
	const { latitude, longitude } = coordinates;
	if (latitude === undefined || longitude === undefined) {
		throw new Error('Both latitude and longitude are required when coordinates are provided');
	}
	if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
		throw new Error('Latitude and longitude must be finite numbers');
	}
	if (latitude < -90 || latitude > 90) {
		throw new Error('Latitude must be between -90 and 90 degrees');
	}
	if (longitude < -180 || longitude > 180) {
		throw new Error('Longitude must be between -180 and 180 degrees');
	}
	return {
		latitude: roundCoordinate(latitude),
		longitude: roundCoordinate(longitude),
	};
};

const normalizeLocation = (location: PropertyLocation): PropertyLocation => {
	const normalized: PropertyLocation = {
		addressLine1: ensureRequiredString(location.addressLine1, 'addressLine1'),
		city: ensureRequiredString(location.city, 'city'),
		postalCode: ensureRequiredString(location.postalCode, 'postalCode'),
		country: ensureRequiredString(location.country, 'country'),
	};

	if (location.addressLine2) normalized.addressLine2 = location.addressLine2.trim();
	if (location.state) normalized.state = location.state.trim();

	const coordinates = normalizeCoordinates(location.coordinates);
	if (coordinates) normalized.coordinates = coordinates;

	return normalized;
};

const applyLocationUpdate = (
	current: PropertyLocation,
	updates: PropertyLocationUpdate,
): PropertyLocation => {
	const next: PropertyLocation = {
		addressLine1: updates.addressLine1
			? ensureRequiredString(updates.addressLine1, 'addressLine1')
			: current.addressLine1,
		city: updates.city ? ensureRequiredString(updates.city, 'city') : current.city,
		postalCode: updates.postalCode
			? ensureRequiredString(updates.postalCode, 'postalCode')
			: current.postalCode,
		country: updates.country
			? ensureRequiredString(updates.country, 'country')
			: current.country,
	};

	if (updates.addressLine2 !== undefined) {
		next.addressLine2 = updates.addressLine2?.trim() || undefined;
	} else if (current.addressLine2) {
		next.addressLine2 = current.addressLine2;
	}

	if (updates.state !== undefined) {
		next.state = updates.state?.trim() || undefined;
	} else if (current.state) {
		next.state = current.state;
	}

	if (updates.coordinates !== undefined) {
		const coordinates = updates.coordinates === null
			? undefined
			: normalizeCoordinates(updates.coordinates);
		if (coordinates) next.coordinates = coordinates;
	} else if (current.coordinates) {
		next.coordinates = { ...current.coordinates };
	}

	return next;
};

const mergeCharacteristics = (
	current: PropertyCharacteristics,
	updates: PropertyCharacteristics,
): PropertyCharacteristics => {
	const next: PropertyCharacteristics = {
		...current,
		...updates,
	};

	if (updates.area) {
		next.area = {
			...current.area,
			...updates.area,
		};
	}

	return next;
};

export class Bien {
	public readonly id?: string;
	public readonly ownerId: string;
	public readonly createdAt: Date;

	private _title: string;
	private _description?: string;
	private _price: number;
	private _currency: string;
	private _type: PropertyType;
	private _status: PropertyStatus;
	private _location: PropertyLocation;
	private _characteristics: PropertyCharacteristics;
	private _amenities: string[];
	private _media: string[];
	private _tags: string[];
	private _updatedAt: Date;

	public constructor(props: BienProps) {
		this.id = props.id;
		this.ownerId = props.ownerId;
		this._title = props.title.trim();
		this._description = props.description?.trim();
		this._price = props.price;
		this._currency = (props.currency ?? DEFAULT_CURRENCY).toUpperCase();
		this._type = props.type;
		this._status = props.status ?? DEFAULT_STATUS;
		this._location = normalizeLocation(props.location);
		this._characteristics = cloneCharacteristics(props.characteristics);
		this._amenities = normalizeStringArray(props.amenities);
		this._media = normalizeStringArray(props.media);
		this._tags = normalizeStringArray(props.tags);
		this.createdAt = props.createdAt ?? new Date();
		this._updatedAt = props.updatedAt ?? this.createdAt;
	}

	public static create(payload: BienCreationPayload): Bien {
		return new Bien({
			ownerId: payload.ownerId,
			title: payload.title,
			description: payload.description,
			price: payload.price,
			currency: payload.currency ?? DEFAULT_CURRENCY,
			type: payload.type,
			status: payload.status ?? DEFAULT_STATUS,
			location: payload.location,
			characteristics: payload.characteristics ?? {},
			amenities: payload.amenities ?? [],
			media: payload.media ?? [],
			tags: payload.tags ?? [],
		});
	}

	public get title(): string {
		return this._title;
	}

	public get description(): string | undefined {
		return this._description;
	}

	public get price(): number {
		return this._price;
	}

	public get currency(): string {
		return this._currency;
	}

	public get type(): PropertyType {
		return this._type;
	}

	public get status(): PropertyStatus {
		return this._status;
	}

	public get location(): PropertyLocation {
		const copy: PropertyLocation = {
			addressLine1: this._location.addressLine1,
			city: this._location.city,
			postalCode: this._location.postalCode,
			country: this._location.country,
		};
		if (this._location.addressLine2) copy.addressLine2 = this._location.addressLine2;
		if (this._location.state) copy.state = this._location.state;
		if (this._location.coordinates) copy.coordinates = { ...this._location.coordinates };
		return copy;
	}

	public get coordinates(): PropertyLocationCoordinates | undefined {
		return this._location.coordinates ? { ...this._location.coordinates } : undefined;
	}

	public get characteristics(): PropertyCharacteristics {
		return cloneCharacteristics(this._characteristics);
	}

	public get amenities(): string[] {
		return [...this._amenities];
	}

	public get media(): string[] {
		return [...this._media];
	}

	public get tags(): string[] {
		return [...this._tags];
	}

	public get updatedAt(): Date {
		return this._updatedAt;
	}

	public update(payload: BienUpdatePayload): void {
		let modified = false;

		if (payload.title && payload.title.trim() !== this._title) {
			this._title = payload.title.trim();
			modified = true;
		}

		if (payload.description !== undefined && payload.description?.trim() !== this._description) {
			this._description = payload.description?.trim();
			modified = true;
		}

		if (payload.price !== undefined && payload.price !== this._price) {
			this._price = payload.price;
			modified = true;
		}

		if (payload.currency && payload.currency.toUpperCase() !== this._currency) {
			this._currency = payload.currency.toUpperCase();
			modified = true;
		}

		if (payload.status && payload.status !== this._status) {
			this._status = payload.status;
			modified = true;
		}

		if (payload.location) {
			const nextLocation = applyLocationUpdate(this._location, payload.location);
			if (!locationsAreEqual(nextLocation, this._location)) {
				this._location = nextLocation;
				modified = true;
			}
		}

		if (payload.amenities) {
			const next = normalizeStringArray(payload.amenities);
			if (!arraysAreEqual(next, this._amenities)) {
				this._amenities = next;
				modified = true;
			}
		}

		if (payload.media) {
			const next = normalizeStringArray(payload.media);
			if (!arraysAreEqual(next, this._media)) {
				this._media = next;
				modified = true;
			}
		}

		if (payload.tags) {
			const next = normalizeStringArray(payload.tags);
			if (!arraysAreEqual(next, this._tags)) {
				this._tags = next;
				modified = true;
			}
		}

		if (payload.characteristics) {
			const merged = mergeCharacteristics(this._characteristics, payload.characteristics);
			if (!compareCharacteristics(this._characteristics, merged)) {
				this._characteristics = merged;
				modified = true;
			}
		}

		if (modified) {
			this.touch();
		}
	}

	public updateCharacteristics(characteristics: PropertyCharacteristics): void {
		const merged = mergeCharacteristics(this._characteristics, characteristics);
		if (!compareCharacteristics(this._characteristics, merged)) {
			this._characteristics = merged;
			this.touch();
		}
	}

	public setStatus(status: PropertyStatus): void {
		if (status === this._status) return;
		this._status = status;
		this.touch();
	}

	public setType(type: PropertyType): void {
		if (type === this._type) return;
		this._type = type;
		this.touch();
	}

	public addMedia(items: string[]): void {
		const normalised = normalizeStringArray(items);
		if (normalised.length === 0) return;
		const next = [...this._media];
		let modified = false;
		for (const item of normalised) {
			if (!next.includes(item)) {
				next.push(item);
				modified = true;
			}
		}
		if (modified) {
			this._media = next;
			this.touch();
		}
	}

	public removeMedia(items: string[]): void {
		if (items.length === 0) return;
		const set = new Set(items.map((item) => item.trim()));
		const filtered = this._media.filter((item) => !set.has(item));
		if (!arraysAreEqual(filtered, this._media)) {
			this._media = filtered;
			this.touch();
		}
	}

	private touch(): void {
		this._updatedAt = new Date();
	}

	public toPersistence(): BienProps {
		return {
			id: this.id,
			ownerId: this.ownerId,
			title: this._title,
			description: this._description,
			price: this._price,
			currency: this._currency,
			type: this._type,
			status: this._status,
			location: this.location,
			characteristics: this.characteristics,
			amenities: [...this._amenities],
			media: [...this._media],
			tags: [...this._tags],
			createdAt: this.createdAt,
			updatedAt: this._updatedAt,
		};
	}

	public toJSON(): BienDTO {
		return {
			id: this.id,
			ownerId: this.ownerId,
			title: this._title,
			description: this._description,
			price: this._price,
			currency: this._currency,
			type: this._type,
			status: this._status,
			location: this.location,
			characteristics: this.characteristics,
			amenities: [...this._amenities],
			media: [...this._media],
			tags: [...this._tags],
			createdAt: this.createdAt,
			updatedAt: this._updatedAt,
		};
	}
}

const arraysAreEqual = (a: string[], b: string[]): boolean => {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i += 1) {
		if (a[i] !== b[i]) return false;
	}
	return true;
};

const compareCharacteristics = (
	previous: PropertyCharacteristics,
	next: PropertyCharacteristics,
): boolean => {
	return JSON.stringify(previous) === JSON.stringify(next);
};

const coordinatesAreEqual = (
	first?: PropertyLocationCoordinates,
	second?: PropertyLocationCoordinates,
): boolean => {
	if (!first && !second) return true;
	if (!first || !second) return false;
	return first.latitude === second.latitude && first.longitude === second.longitude;
};

const locationsAreEqual = (
	first: PropertyLocation,
	second: PropertyLocation,
): boolean => {
	if (first.addressLine1 !== second.addressLine1) return false;
	if (first.city !== second.city) return false;
	if (first.postalCode !== second.postalCode) return false;
	if (first.country !== second.country) return false;
	if ((first.addressLine2 ?? undefined) !== (second.addressLine2 ?? undefined)) return false;
	if ((first.state ?? undefined) !== (second.state ?? undefined)) return false;
	if (!coordinatesAreEqual(first.coordinates, second.coordinates)) return false;
	return true;
};
