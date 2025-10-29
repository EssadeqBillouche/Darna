import {
	BienCreationPayload,
	BienDTO,
	BienProps,
	BienUpdatePayload,
	PropertyCharacteristics,
	PropertyLocation,
	PropertyLocationUpdate,
	PropertyStatus,
	PropertyType,
} from '../types/Bien';

const DEFAULT_CURRENCY = 'MAD';
const DEFAULT_STATUS = PropertyStatus.DRAFT;

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
	private _yearBuilt?: number;
	private _area?: number;
	private _media: string[];
	private _updatedAt: Date;

	public constructor(props: BienProps) {
		this.id = props.id;
		this.ownerId = props.ownerId;
		this._title = props.title;
		this._description = props.description;
		this._price = props.price;
		this._currency = props.currency ?? DEFAULT_CURRENCY;
		this._type = props.type;
		this._status = props.status ?? DEFAULT_STATUS;
		this._location = this.cloneLocation(props.location);
		this._characteristics = { ...(props.characteristics ?? {}) };
		this._yearBuilt = props.yearBuilt;
		this._area = props.area;
		this._media = props.media ? [...props.media] : [];
		this.createdAt = props.createdAt ?? new Date();
		this._updatedAt = props.updatedAt ?? new Date();
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
			yearBuilt: payload.yearBuilt,
			area: payload.area,
			media: payload.media ?? [],
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
		return this.cloneLocation(this._location);
	}

	public get characteristics(): PropertyCharacteristics {
		return { ...this._characteristics };
	}

	public get yearBuilt(): number | undefined {
		return this._yearBuilt;
	}

	public get area(): number | undefined {
		return this._area;
	}

	public get media(): string[] {
		return [...this._media];
	}

	public get updatedAt(): Date {
		return this._updatedAt;
	}

	public update(payload: BienUpdatePayload): void {
		let changed = false;

		if (payload.title !== undefined && payload.title !== this._title) {
			this._title = payload.title;
			changed = true;
		}

		if (payload.description !== undefined && payload.description !== this._description) {
			this._description = payload.description ?? undefined;
			changed = true;
		}

		if (payload.price !== undefined && payload.price !== this._price) {
			this._price = payload.price;
			changed = true;
		}

		if (payload.currency !== undefined && payload.currency !== this._currency) {
			this._currency = payload.currency;
			changed = true;
		}

		if (payload.status !== undefined && payload.status !== this._status) {
			this._status = payload.status;
			changed = true;
		}

		if (payload.location !== undefined) {
			this._location = this.applyLocationUpdate(payload.location);
			changed = true;
		}

		if (payload.characteristics !== undefined) {
			this._characteristics = {
				...this._characteristics,
				...payload.characteristics,
			};
			changed = true;
		}

		if (payload.yearBuilt !== undefined) {
			this._yearBuilt = payload.yearBuilt ?? undefined;
			changed = true;
		}

		if (payload.area !== undefined) {
			this._area = payload.area ?? undefined;
			changed = true;
		}

		if (payload.media !== undefined) {
			this._media = [...payload.media];
			changed = true;
		}

		if (changed) this.touch();
	}

	public updateCharacteristics(characteristics: PropertyCharacteristics): void {
		this._characteristics = {
			...this._characteristics,
			...characteristics,
		};
		this.touch();
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
		if (!items.length) return;
		this._media.push(...items);
		this.touch();
	}

	public removeMedia(items: string[]): void {
		if (!items.length) return;
		const blacklist = new Set(items);
		const filtered = this._media.filter((item) => !blacklist.has(item));
		if (filtered.length !== this._media.length) {
			this._media = filtered;
			this.touch();
		}
	}

	private applyLocationUpdate(update: PropertyLocationUpdate): PropertyLocation {
		return {
			address: update.address ?? this._location.address,
			city: update.city ?? this._location.city,
			state: update.state === null ? undefined : update.state ?? this._location.state,
			postalCode: update.postalCode === null ? undefined : update.postalCode ?? this._location.postalCode,
			coordinates: update.coordinates === null
				? undefined
				: update.coordinates ?? (this._location.coordinates ? { ...this._location.coordinates } : undefined),
		};
	}

	private cloneLocation(source: PropertyLocation): PropertyLocation {
		return {
			address: source.address,
			city: source.city,
			state: source.state,
			postalCode: source.postalCode,
			coordinates: source.coordinates ? { ...source.coordinates } : undefined,
		};
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
			yearBuilt: this._yearBuilt,
			area: this._area,
			media: [...this._media],
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
			yearBuilt: this._yearBuilt,
			area: this._area,
			media: [...this._media],
			createdAt: this.createdAt,
			updatedAt: this._updatedAt,
		};
	}
}
