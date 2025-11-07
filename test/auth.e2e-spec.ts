import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Sobrescribimos el módulo de TypeORM para usar una DB en memoria
      .overrideModule(TypeOrmModule)
      .useModule(
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:', // Base de datos en memoria
          entities: [`${__dirname  }/../src/**/*.entity{.ts,.js}`],
          synchronize: true, // Crea el schema automáticamente
        }),
      )
      .compile();

    app = moduleFixture.createNestApplication();

    // Importante: Aplicamos el mismo ValidationPipe que en main.ts
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should return a JWT on successful login', async () => {
      const signInDto = {
        username: 'pruebasuno',
        password: 'Colombia2025*',
      };

      await request(httpServer)
        .post('/auth/login')
        .send(signInDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(typeof res.body.access_token).toBe('string');
        });
    });

    it('should return 401 for incorrect password', async () => {
      const signInDto = {
        username: 'pruebasuno',
        password: 'wrongpassword',
      };

      await request(httpServer)
        .post('/auth/login')
        .send(signInDto)
        .expect((res) => {
          expect(res.status).toBe(401);
        });
    });

    it('should return 401 for non-existent user', async () => {
      const signInDto = {
        username: 'nonexistent',
        password: 'anypassword',
      };

      await request(httpServer)
        .post('/auth/login')
        .send(signInDto)
        .expect((res) => {
          expect(res.status).toBe(401);
        });
    });

    it('should return 406 for missing credentials (ValidationPipe)', async () => {
      const signInDto = {
        username: 'pruebasuno',
      };

      await request(httpServer)
        .post('/auth/login')
        .send(signInDto)
        .expect((res) => {
          expect(res.status).toBe(406);
        });
    });
  });
});
