# api-transactional-service


**api-transactional-service** es una aplicación backend de servicio transaccional, desarrollada en NestJS.

---

- [Estructura del Proyecto](#project-structure)
- [Dependencias](#dependencies)
- [Ejecución](#run)
- [Pruebas](#test)
- [Decisiones técnicas](#tech-decision)

---

# Estructura del proyecto  <a name="project-structure"></a>

Las carpetas y archivos del proyecto están organizados de la siguiente manera:

```
src/
├── app.module.ts
├── main.ts
├── auth/
    ├── dto/
        └── sign-in.dto.ts
    ├── auth.controller.ts
    ├── auth.guard.ts
    ├── auth.module.ts
    ├── auth.service.spec.ts
    └── auth.service.ts
├── recharges/
    ├── dto/
        └── create-recharge.dto.ts
    ├── entities/
        └── recharge.entity.ts
    ├── recharges.controller.ts
    ├── recharges.module.ts
    ├── recharges.service.spec.ts
    └── recharges.service.ts
├── transactions/
    ├── entities/
        └── transaction.entity.ts
    ├── transactions.module.ts
    ├── transactions.service.spec.ts
    └── transactions.service.ts
├── users/
    ├── interfaces/
        └── user.interface.ts
    ├── users.module.ts
    ├── users.service.spec.ts
    └── users.service.ts

test/
├── auth.e2e-spec.ts
└── recharges.e2e-spec.ts
                  
```

---

# Dependencias <a name="dependencies"></a>

- `NestJS` Framework de Node.js para diseño de aplicaciones eficientes y escalables.
- `TypeScript` Lenguaje de programación tipado construido sobre JavaScript para código más seguro y mantenible.
- `class-validator` Permite uso de decoradores basados en validación
- `class-transformer` Para transformación de objetos planos en instancia de clases
- `sqlite3` Librería de SQLite para NodeJS
- `typeorm` ORM de bases de datos para TypeScript

# Ejecución <a name="run"></a>

```bash
# 1. Clonar el repositorio
git clone https://github.com/oapinzond/api-transactional-service.git
cd api-transactional-service

# 2. Instalar dependencias
npm install

# 3. Ejecutar el servidor de Desarrollo
npm run start:dev

# 4. Autenticación y obtención de token
curl --location "http://localhost:3000/auth/login" \
--header 'Content-Type: application/json' \
--data '{
    "username": "testuser",
    "password": "password123"
}'

# 5. Procesar recarga
curl --location "http://localhost:3000/recharges/buy" \
--header "Authorization: Bearer $TOKEN" \
--header 'Content-Type: application/json' \
--data '{
    "amount": 5000,
    "phoneNumber": "3101234567"
}'

# 6. Obtener historial
curl --location "http://localhost:3000/recharges/history" \
--header "Authorization: Bearer $TOKEN"
```

# Pruebas <a name="test"></a>

- `npm run test` - Tests unitarios
- `npm run test:e2e` - Tests de integración
- `npm run test:cov` - Tests con cobertura

# Decisiones técnicas <a name="tech-decision"></a>

- `SQLite + TypeORM`: motor de base de datos liviano para fácil configuración
- `class-validator` + `ValidationPipe`: Validación de estructura del DTO, antes de llegar al servicio
