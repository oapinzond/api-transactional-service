import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppModule } from '../src/app.module';
import { CreateRechargeDto } from '../src/recharges/dto/create-recharge.dto';

describe('RechargesController (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(TypeOrmModule)
      .useModule(
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [`${__dirname  }/../src/**/*.entity{.ts,.js}`],
          synchronize: true,
        }),
      )
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        stopAtFirstError: true,
        whitelist: true,
        errorHttpStatusCode: 406,
        transform: true,
      }),
    );

    await app.init();
    httpServer = app.getHttpServer();

    const loginDto = {
      username: 'pruebasuno',
      password: 'Colombia2025*',
    };
    const response = await request(httpServer)
      .post('/auth/login')
      .send(loginDto);
    jwtToken = response.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/recharges/buy (POST)', () => {
    const validRechargeDto: CreateRechargeDto = {
      amount: 5000,
      phoneNumber: '3001234567',
    };

    it('should fail without an authorization token (401)', async () => {
      await request(httpServer)
        .post('/recharges/buy')
        .send(validRechargeDto)
        .expect(401);
      expect(true).toBe(true);
    });

    it('should fail with an invalid phone number (406)', async () => {
      const invalidDto = {
        amount: 5000,
        phoneNumber: '123',
      };

      await request(httpServer)
        .post('/recharges/buy')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(invalidDto)
        .expect(406);
      expect(true).toBe(true);
    });

    it('should fail if amount is less than 1000 (409)', async () => {
      const invalidDto = {
        amount: 999,
        phoneNumber: '3001234567',
      };

      await request(httpServer)
        .post('/recharges/buy')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(invalidDto)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toBe('Monto no válido');
        });
    });

    it('should fail if amount is greater than 100000 (409)', async () => {
      const invalidDto = {
        amount: 100001,
        phoneNumber: '3001234567',
      };

      await request(httpServer)
        .post('/recharges/buy')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(invalidDto)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toBe('Monto no válido');
        });
    });

    it('should create a recharge successfully (200)', async () => {
      await request(httpServer)
        .post('/recharges/buy')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(validRechargeDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toStrictEqual(
            expect.objectContaining({
              id: expect.any(String),
              phoneNumber: validRechargeDto.phoneNumber,
              amount: validRechargeDto.amount,
              userId: 'pruebasuno',
              createdAt: expect.any(String),
            }),
          );
        });
    });
  });

  describe('/recharges/history (GET)', () => {
    it('should fail without an authorization token (401)', async () => {
      await request(httpServer)
        .get('/recharges/history')
        .expect(401);
      expect(true).toBe(true);
    });

    it('should return 404 for a user with no history', async () => {
      const loginDto = {
        username: 'pruebastres',
        password: 'Test25%',
      };
      const res = await request(httpServer).post('/auth/login').send(loginDto);
      const otherToken = res.body.access_token;

      await request(httpServer)
        .get('/recharges/history')
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);
      expect(true).toBe(true);
    });

    it('should return history for the user with recharges (200)', async () => {
      // Este test depende de que el test de 'buy' (arriba) se haya ejecutado
      // y creado una recarga para 'pruebasuno'.
      const res = await request(httpServer)
        .get('/recharges/history')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
});
