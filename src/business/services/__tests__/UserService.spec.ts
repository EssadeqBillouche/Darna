import { UserService } from '../UserService';
import { UserRole } from '../../enums/Role';
import { User } from '../../entities/User';
import type { UserProps } from '../../types/User';
import UserRepository from '../../../persistence/repositories/UserRepository';
import { EmailService } from '../../../infrastructure/notifications/email.service';
import JwtService from '../../../infrastructure/security/jwt';

const makeRepositoryMock = (): jest.Mocked<UserRepository> => ({
  findByEmail: jest.fn(),
  findByVerificationToken: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  getUserById: jest.fn(),
  updateStatus: jest.fn(),
}) as unknown as jest.Mocked<UserRepository>;

const makeEmailServiceMock = (): jest.Mocked<EmailService> => ({
  sendVerificationEmail: jest.fn(),
  sendCredentialsEmail: jest.fn(),
}) as unknown as jest.Mocked<EmailService>;

const buildUser = (overrides: Partial<UserProps> = {}): User => {
  const defaults: UserProps = {
    id: 'user-1',
    email: 'user@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    password: 'hashed-password',
    role: UserRole.Client,
    phoneNumber: '+212600000000',
    isVerified: false,
    status: 'active',
    profilePicture: undefined,
    verificationToken: null,
    verificationTokenExpiresAt: null,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };
  return new User({ ...defaults, ...overrides });
};

const userToProps = (user: User, overrides: Partial<UserProps> = {}): UserProps => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  password: (user as any)._passwordHash,
  role: user.role,
  phoneNumber: user.phoneNumber,
  isVerified: user.isVerified,
  profilePicture: user.profilePicture,
  status: user.status,
  verificationToken: user.verificationToken ?? null,
  verificationTokenExpiresAt: user.verificationTokenExpiresAt ?? null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  ...overrides,
});

describe('UserService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('register', () => {
    test('creates a user, persists token, and sends verification email', async () => {
      jest.useFakeTimers();
      const now = new Date('2024-02-01T00:00:00.000Z');
      jest.setSystemTime(now);

      const repository = makeRepositoryMock();
      const emailService = makeEmailServiceMock();
      const service = new UserService(repository, emailService);

      repository.findByEmail.mockResolvedValue(null);

      let capturedToken: string | null | undefined;
      let capturedExpiry: Date | null | undefined;

      repository.create.mockImplementation(async (entity) => {
        capturedToken = entity.verificationToken;
        capturedExpiry = entity.verificationTokenExpiresAt ?? null;
        return new User(userToProps(entity, { id: 'generated-id' }));
      });

      const result = await service.register({
        email: 'new.user@darna.ma',
        password: 'Plain#12345',
        firstName: 'New',
        lastName: 'User',
        phoneNumber: '+212611111111',
        role: UserRole.Client,
      });

      expect(repository.findByEmail).toHaveBeenCalledWith('new.user@darna.ma');
      expect(repository.create).toHaveBeenCalledTimes(1);

      expect(emailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      const emailPayload = emailService.sendVerificationEmail.mock.calls[0][0];
      expect(emailPayload.to).toBe('new.user@darna.ma');
      expect(typeof emailPayload.token).toBe('string');
      expect(emailPayload.token).toBe(capturedToken);
      expect(emailPayload.expiresAt).toBeInstanceOf(Date);

      const expectedExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      expect(capturedExpiry?.getTime()).toBe(expectedExpiry.getTime());

      expect(result).toMatchObject({
        id: 'generated-id',
        email: 'new.user@darna.ma',
        role: UserRole.Client,
        isVerified: false,
      });
    });

    test('throws when email already exists', async () => {
      const repository = makeRepositoryMock();
      const emailService = makeEmailServiceMock();
      const service = new UserService(repository, emailService);

      repository.findByEmail.mockResolvedValue(buildUser({ email: 'taken@darna.ma' }));

      await expect(
        service.register({
          email: 'taken@darna.ma',
          password: 'Plain#12345',
          firstName: 'Taken',
          lastName: 'User',
          role: UserRole.Client,
        })
      ).rejects.toThrow('Email already exists');

      expect(repository.create).not.toHaveBeenCalled();
      expect(emailService.sendVerificationEmail).not.toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    test('verifies user and clears verification token', async () => {
      const repository = makeRepositoryMock();
      const emailService = makeEmailServiceMock();
      const service = new UserService(repository, emailService);

      const user = buildUser({
        verificationToken: 'token-123',
        verificationTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });

      repository.findByVerificationToken.mockResolvedValue(user);
      repository.update.mockImplementation(async (entity) => new User(userToProps(entity)));

      const result = await service.verifyEmail('token-123');

      expect(repository.update).toHaveBeenCalledTimes(1);
      const updatedEntity = repository.update.mock.calls[0][0];
      expect(updatedEntity.isVerified).toBe(true);
      expect(updatedEntity.verificationToken).toBeNull();
      expect(result.isVerified).toBe(true);
    });

    test('throws when verification token expired', async () => {
      const repository = makeRepositoryMock();
      const emailService = makeEmailServiceMock();
      const service = new UserService(repository, emailService);

      const user = buildUser({
        verificationToken: 'token-abc',
        verificationTokenExpiresAt: new Date(Date.now() - 1000),
      });

      repository.findByVerificationToken.mockResolvedValue(user);
      repository.update.mockImplementation(async (entity) => new User(userToProps(entity)));

      await expect(service.verifyEmail('token-abc')).rejects.toThrow('Verification token has expired');

      expect(repository.update).toHaveBeenCalledTimes(1);
      const updatedEntity = repository.update.mock.calls[0][0];
      expect(updatedEntity.verificationToken).toBeNull();
    });
  });

  describe('changeUserStatus', () => {
    test('updates user status when valid status provided', async () => {
      const repository = makeRepositoryMock();
      const emailService = makeEmailServiceMock();
      const service = new UserService(repository, emailService);

      const user = buildUser({ status: 'active' });

      repository.getUserById.mockResolvedValue(user);
      repository.updateStatus.mockImplementation(async (entity) => new User(userToProps(entity)));

      const result = await service.changeUserStatus('user-1', 'suspended');

      expect(repository.getUserById).toHaveBeenCalledWith('user-1');
      expect(repository.updateStatus).toHaveBeenCalledTimes(1);
      const updatedEntity = repository.updateStatus.mock.calls[0][0];
      expect(updatedEntity.status).toBe('suspended');
      expect(result.status).toBe('suspended');
    });

    test('throws when status is invalid', async () => {
      const repository = makeRepositoryMock();
      const emailService = makeEmailServiceMock();
      const service = new UserService(repository, emailService);

      repository.getUserById.mockResolvedValue(buildUser());

      await expect(service.changeUserStatus('user-1', 'unknown')).rejects.toThrow('User status is invalid');

      expect(repository.getUserById).toHaveBeenCalledWith('user-1');
      expect(repository.updateStatus).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    test('returns JWT when credentials are valid and user verified', async () => {
      const repository = makeRepositoryMock();
      const emailService = makeEmailServiceMock();
      const service = new UserService(repository, emailService);

      const user = buildUser({ isVerified: true });

      repository.findByEmail.mockResolvedValue(user);
      jest.spyOn(user, 'comparePassword').mockResolvedValue(true);
      jest.spyOn(JwtService, 'generateToken').mockResolvedValue('jwt-token');

      const token = await service.login({ email: 'user@example.com', password: 'secret' });

      expect(repository.findByEmail).toHaveBeenCalledWith('user@example.com');
      expect(user.comparePassword).toHaveBeenCalledWith('secret');
      expect(JwtService.generateToken).toHaveBeenCalledWith(user.toJSON());
      expect(token).toBe('jwt-token');
    });

    test('throws when password is incorrect', async () => {
      const repository = makeRepositoryMock();
      const emailService = makeEmailServiceMock();
      const service = new UserService(repository, emailService);

      const user = buildUser({ isVerified: true });

      repository.findByEmail.mockResolvedValue(user);
      jest.spyOn(user, 'comparePassword').mockResolvedValue(false);

      await expect(service.login({ email: 'user@example.com', password: 'bad-pass' }))
        .rejects.toThrow('Login failed: Password incorrect');
    });
  });
});
