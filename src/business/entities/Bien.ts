import {
	BienProps,
	BienDTO,
	BienUpdatePayload,
	BienCreationPayload,
	PropertyCharacteristics,
	PropertyLocation,
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

const normalizeStringArray = (values?: string[]): string[] => {
	if (!values || values.length === 0) return [];
	return values
		.map((value) => value.trim())
		.filter((value, index, self) => value.length > 0 && self.indexOf(value) === index);
};

const normalizeLocation = (location: PropertyLocation): PropertyLocation => {
	return {
		...location,
		addressLine1: location.addressLine1.trim(),
		addressLine2: location.addressLine2?.trim() || undefined,
		city: location.city.trim(),
		state: location.state?.trim(),
		postalCode: location.postalCode.trim(),
		country: location.country.trim(),
		coordinates: location.coordinates
			? { ...location.coordinates }
			: undefined,
	};
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
		return { ...this._location, coordinates: this._location.coordinates ? { ...this._location.coordinates } : undefined };
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
			const normalisedLocation = normalizeLocation(payload.location);
			if (JSON.stringify(normalisedLocation) !== JSON.stringify(this._location)) {
				this._location = normalisedLocation;
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
