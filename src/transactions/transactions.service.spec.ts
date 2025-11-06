import { randomUUID } from 'node:crypto'; // Importamos el original para mockearlo

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';

import { TransactionsService } from './transactions.service';
import { Transaction } from './entities/transaction.entity';

// 1. Mockear dependencias externas (node:crypto)
// Hacemos esto para que 'randomUUID()' siempre devuelva el mismo valor en los tests
jest.mock('node:crypto', () => ({
  randomUUID: jest.fn(),
}));

// Definimos un tipo helper para nuestro repositorio mockeado
type MockRepository<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('TransactionsService', () => {
  let service: TransactionsService;
  let repository: MockRepository<Transaction> & { save: jest.Mock };

  // Variables para los mocks
  const mockUuid = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
  const mockDate = '2025-01-01T12:00:00.000Z';
  
  // Referencia al mock de randomUUID
  const mockedRandomUUID = randomUUID as jest.Mock;

  // 2. Mockear la fecha (new Date())
  // Usamos 'jest.useFakeTimers' para controlar el 'new Date()'
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date(mockDate));
  });

  beforeEach(async () => {
    // Resetear mocks antes de cada test
    mockedRandomUUID.mockReturnValue(mockUuid);

    // 3. Configurar el Módulo de Testing de NestJS
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          // 4. Proveer el mock del Repositorio
          provide: getRepositoryToken(Transaction),
          // Usamos 'useValue' para definir el objeto mock
          useValue: {
            save: jest.fn(), // Solo necesitamos mockear 'save' porque es lo único que usa el servicio
          } as MockRepository<Transaction>,
        },
      ],
    }).compile();

    // 5. Obtener las instancias del servicio y del repositorio mock
       service = module.get<TransactionsService>(TransactionsService);
       repository = module.get(
         getRepositoryToken(Transaction),
       );
  });

  afterEach(() => {
    // Limpiar los mocks después de cada test
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers(); // Restaurar temporizadores reales
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Pruebas para el método 'create' ---
  describe('create', () => {
    it('should successfully create and save a transaction', async () => {
      // --- Arrange (Preparar) ---
      const amount = 12990;
      const userId = 'pruebasdos';

      // El objeto que esperamos que se construya y se guarde
      const expectedTransaction = {
        id: mockUuid,
        amount: amount,
        user_id: userId,
        created_at: mockDate,
      };

      // Configuramos el mock de 'save' para que devuelva el objeto esperado
      // Usamos 'mockResolvedValue' porque 'save' es un método asíncrono
      repository.save.mockResolvedValue(expectedTransaction);

      // --- Act (Actuar) ---
      const result = await service.create(amount, userId);

      // --- Assert (Verificar) ---

      // 1. Verificar que 'randomUUID' fue llamado
      expect(mockedRandomUUID).toHaveBeenCalledTimes(1);

      // 2. Verificar que 'repository.save' fue llamado
      expect(repository.save).toHaveBeenCalledTimes(1);

      // 3. Verificar CON QUÉ fue llamado 'repository.save'
      // Comprobamos que se llamó con una instancia de Transaction
      expect(repository.save).toHaveBeenCalledWith(expect.any(Transaction));
      // Comprobamos que la instancia tenía las propiedades correctas
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUuid,
          amount: amount,
          user_id: userId,
          created_at: mockDate,
        }),
      );
      
      // 4. Verificar que el método 'create' devolvió lo que 'save' le dio
      expect(result).toStrictEqual(expectedTransaction);
    });
  });
});
