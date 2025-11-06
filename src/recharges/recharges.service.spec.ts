import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { TransactionsService } from '../transactions/transactions.service';
import { Transaction } from '../transactions/entities/transaction.entity';

import { RechargesService } from './recharges.service';
import { Recharge } from './entities/recharge.entity';

// --- Definición de Mocks ---
// Un tipo genérico para nuestros repositorios mock
type MockRepository<T extends object = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

// Un tipo para nuestro servicio mock
interface MockTransactionsService {
  create: jest.Mock;
}

// --- Mock del QueryBuilder ---
// Necesitamos simular la cadena de métodos: createQueryBuilder().innerJoinAndSelect()...getRawMany()
const mockQueryBuilder = {
  innerJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getRawMany: jest.fn(),
};

describe('RechargesService', () => {
  let service: RechargesService;
  let mockRechargesRepo: MockRepository<Recharge>;
  let mockTransactionsRepo: MockRepository<Transaction>;
  let mockTransactionsSvc: MockTransactionsService;

  beforeEach(async () => {
    // Resetea todos los mocks antes de cada test
    jest.clearAllMocks();

    // --- Creación de los Mocks ---
    mockRechargesRepo = {
      save: jest.fn() as any,
    };

    mockTransactionsRepo = {
      // Simulamos que createQueryBuilder devuelve nuestro mockQueryBuilder
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    mockTransactionsSvc = {
      create: jest.fn(),
    };

    // --- Creación del Módulo de Testing ---
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RechargesService, // El servicio real que queremos probar
        {
          provide: TransactionsService,
          useValue: mockTransactionsSvc, // Mock del servicio de transacciones
        },
        {
          provide: getRepositoryToken(Recharge),
          useValue: mockRechargesRepo, // Mock del repositorio de recargas
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionsRepo, // Mock del repositorio de transacciones
        },
      ],
    }).compile();

    // Obtenemos las instancias (el servicio real y los mocks)
    service = module.get<RechargesService>(RechargesService);
    mockRechargesRepo = module.get(getRepositoryToken(Recharge));
    mockTransactionsRepo = module.get(getRepositoryToken(Transaction));
    mockTransactionsSvc = module.get(TransactionsService);
  });

  // --- Test Básico ---
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Tests para el método create() ---
  describe('create', () => {
    const userId = 'pruebasuno';
    const phoneNumber = '3001234567';

    it('should create a recharge successfully', async () => {
      const amount = 5000;

      // 1. Arrange (Configurar los mocks)
      const mockTransaction = {
        id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        amount: amount,
        user_id: userId,
        created_at: '2025-01-01T10:00:00Z',
      } as Transaction;

      const mockRecharge = {
        transaction_id: mockTransaction.id,
        phone_number: phoneNumber,
        created_at: '2025-01-01T10:00:01Z',
      } as Recharge;

      // Simular lo que devuelven los mocks
      mockTransactionsSvc.create.mockResolvedValue(mockTransaction);
      mockRechargesRepo.save!.mockResolvedValue(mockRecharge);

      // 2. Act (Ejecutar el método)
      const result = await service.create(userId, amount, phoneNumber);

      // 3. Assert (Verificar los resultados)
      const expectedResult = {
        id: mockTransaction.id,
        phoneNumber: mockRecharge.phone_number,
        amount: mockTransaction.amount,
        userId: mockTransaction.user_id,
        createdAt: mockTransaction.created_at,
      };

      expect(result).toStrictEqual(expectedResult);

      // Verificar que los mocks fueron llamados correctamente
      expect(mockTransactionsSvc.create).toHaveBeenCalledWith(amount, userId);
      expect(mockRechargesRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          phone_number: phoneNumber,
          transaction_id: mockTransaction.id,
        }),
      );
    });

    it('should throw ConflictException if amount is less than 1000', async () => {
      const amount = 999;

      // 1. Arrange (No se necesitan mocks, debe fallar antes)
      // 2. Act & 3. Assert (Verificar que lance la excepción)
      await expect(
        service.create(userId, amount, phoneNumber),
      ).rejects.toThrow(ConflictException);

      await expect(
        service.create(userId, amount, phoneNumber),
      ).rejects.toThrow('Monto no válido');

      // Verificar que no se llamó a ningún servicio/repositorio
      expect(mockTransactionsSvc.create).not.toHaveBeenCalled();
      expect(mockRechargesRepo.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if amount is greater than 100000', async () => {
      const amount = 100001;

      // 1. Arrange
      // 2. Act & 3. Assert
      await expect(
        service.create(userId, amount, phoneNumber),
      ).rejects.toThrow(ConflictException);

      await expect(
        service.create(userId, amount, phoneNumber),
      ).rejects.toThrow('Monto no válido');

      // Verificar que no se llamó a ningún servicio/repositorio
      expect(mockTransactionsSvc.create).not.toHaveBeenCalled();
      expect(mockRechargesRepo.save).not.toHaveBeenCalled();
    });
  });

  // --- Tests para el método findByUser() ---
  describe('findByUser', () => {
    const userId = 'pruebastres';

    it('should return a list of recharges for a user', async () => {
      // 1. Arrange
      const mockRawResults = [
        {
          id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
          phoneNumber: '300111222',
          amount: 1000,
          userId: userId,
          createdAt: '2025-01-01T09:00:00Z',
        },
        {
          id: '11111111-2222-3333-4444-555555555555',
          phoneNumber: '300333444',
          amount: 5000,
          userId: userId,
          createdAt: '2025-01-02T14:00:00Z',
        },
      ];

      // Simular el resultado del QueryBuilder
      mockQueryBuilder.getRawMany.mockResolvedValue(mockRawResults);

      // 2. Act
      const result = await service.findByUser(userId);

      // 3. Assert
      expect(result).toStrictEqual(mockRawResults);
      expect(result).toHaveLength(2);

      // Verificar que el QueryBuilder fue llamado correctamente
      expect(mockTransactionsRepo.createQueryBuilder).toHaveBeenCalledWith('a');
      expect(mockQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
        'a.recharge',
        'b',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'a.user_id = :userId',
        { userId: userId },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'a.created_at',
        'ASC',
      );
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
    });

    it('should throw NotFoundException if no recharges are found', async () => {
      // 1. Arrange
      // Simular que el QueryBuilder devuelve un array vacío
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      // 2. Act & 3. Assert
      await expect(service.findByUser(userId)).rejects.toThrow(
        NotFoundException,
      );

      // Verificar que el QueryBuilder se ejecutó
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
    });
  });
});
