import { BienService } from '../BienService';
import { Bien } from '../../entities/Bien';
import {
	PropertyStatus,
	PropertyType,
} from '../../types/Bien';
import BienRepository from '../../../persistence/repositories/BienRepository';

const makeRepositoryMock = (): jest.Mocked<BienRepository> => ({
	create: jest.fn(),
	findAll: jest.fn(),
	findById: jest.fn(),
	findByOwner: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
}) as unknown as jest.Mocked<BienRepository>;

const buildBien = (overrides?: Partial<ConstructorParameters<typeof Bien>[0]>): Bien =>
	new Bien({
		id: 'bien-1',
		ownerId: 'owner-123',
		title: 'Charming apartment',
		description: 'Bright and sunny',
		price: 2500000,
		currency: 'MAD',
		type: PropertyType.APARTMENT,
		status: PropertyStatus.PUBLISHED,
		location: {
			address: '123 Main St',
			city: 'Casablanca',
			state: 'Casablanca-Settat',
			postalCode: '20000',
		},
		characteristics: {
			roomNumber: 4,
			bedRoom: 3,
		},
		media: ['photo-1.jpg'],
		createdAt: new Date('2024-01-01T10:00:00.000Z'),
		updatedAt: new Date('2024-01-02T10:00:00.000Z'),
		...overrides,
	});

describe('BienService', () => {
	afterEach(() => {
		jest.resetAllMocks();
	});

	test('list returns DTOs with pagination defaults', async () => {
		const repository = makeRepositoryMock();
		const bien = buildBien();
		repository.findAll.mockResolvedValue({ items: [bien], total: 1 });

		const service = new BienService(repository);
		const result = await service.list();

		expect(repository.findAll).toHaveBeenCalledWith({
			page: 1,
			limit: 20,
			filters: undefined,
			sort: undefined,
			query: undefined,
		});

		expect(result).toEqual({
			items: [
				expect.objectContaining({
					id: 'bien-1',
					title: 'Charming apartment',
					ownerId: 'owner-123',
				}),
			],
			total: 1,
			page: 1,
			limit: 20,
		});

		expect(result.items[0].createdAt).toBeInstanceOf(Date);
		expect(result.items[0].updatedAt).toBeInstanceOf(Date);
	});

	test('getById throws when property is not found', async () => {
		const repository = makeRepositoryMock();
		repository.findById.mockResolvedValue(null);

		const service = new BienService(repository);

		await expect(service.getById('missing-id')).rejects.toThrow('Property not found');
	});
});
