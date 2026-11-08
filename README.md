# VetSync

Backend modular para gestión de citas veterinarias y telemedicina, construido como un monolito modular con NestJS, aplicando Arquitectura Hexagonal (Ports & Adapters), TDD y los principios SOLID.

## Descripción general

VetSync resuelve tres requerimientos de negocio centrales:

- Registro de mascotas y dueños con historial médico asociado.
- Agendamiento de citas que evita choques de horario para un mismo veterinario.
- Notificaciones (simuladas) por correo cuando una cita está próxima.

## Arquitectura

El proyecto es un modular monolith: un solo proceso/despliegue, pero dividido en módulos de negocio desacoplados entre sí mediante puertos (interfaces) y adaptadores (implementaciones concretas). Ningún módulo importa código de `application`/`domain` de otro módulo directamente; toda comunicación entre módulos pasa por una interfaz (por ejemplo `DuenioValidator`, `VeterinarioValidator`), cumpliendo el principio de Inversión de Dependencias (DIP).

Cada módulo sigue cuatro capas:

```
modules/<modulo>/
├── domain/            Entidades, excepciones, interfaces (puertos), value objects
├── application/       Casos de uso (un caso de uso por clase) y DTOs
├── infrastructure/     Adaptadores: repositorios Prisma, validadores, hashers, JWT
└── presentation/       Controladores HTTP (NestJS)
```

Principios SOLID aplicados:

| Principio | Dónde se aplica |
|---|---|
| SRP | Cada caso de uso es una clase con una sola responsabilidad (`AgendarCitaUseCase`, `CancelarCitaUseCase`, etc.) |
| OCP | Nuevas implementaciones de un puerto (por ejemplo, otro `PasswordHasher`) no requieren tocar los casos de uso |
| LSP | Los adaptadores (`Prisma*Repository`) son intercambiables porque cumplen el contrato exacto de su interfaz de dominio |
| ISP | Interfaces pequeñas y específicas (`DuenioValidator`, `VeterinarioValidator`) en vez de un repositorio único con todas las operaciones |
| DIP | `application`/`domain` dependen de interfaces (`UsuarioRepository`, `TokenGenerator`, etc.), nunca de Prisma u otro módulo directamente; la inyección usa tokens (`Symbol`) vía `@Inject()` |

## Stack tecnológico

| Categoría | Tecnología |
|---|---|
| Runtime / Framework | Node.js + NestJS 11 |
| Lenguaje | TypeScript 5 |
| Base de datos | PostgreSQL (Supabase o local) |
| ORM | Prisma 6 |
| Autenticación | JWT firmado (HS256) vía `jsonwebtoken` |
| Hashing de contraseñas | `bcryptjs` |
| Testing | Jest + ts-jest (TDD) |
| Linting | ESLint 9 (flat config) + `typescript-eslint` |
| Formato | Prettier |

## Estructura del proyecto

```
src/
├── app.module.ts
├── main.ts
├── common/
│   └── filters/http-exception.filter.ts
├── database/
│   ├── prisma.module.ts
│   └── prisma.service.ts
└── modules/
    ├── identity/        Registro y autenticación de usuarios (OWNER / VETERINARIO)
    ├── patients/         Mascotas e historial médico
    ├── scheduling/        Agendamiento de citas
    └── notifications/     Notificaciones simuladas por correo
```

## Requisitos previos

- Node.js 20 o superior
- npm
- Una instancia de PostgreSQL (local, Docker o Supabase)

## Instalación y configuración

```bash
git clone <url-del-repo>
cd Vet
npm install

cp .env.example .env
# Editar .env: DATABASE_URL real y un JWT_SECRET propio

npm run prisma:generate
npx prisma migrate dev

npm run start:dev
```

Por defecto el servidor escucha en `http://localhost:3000` (configurable con la variable `PORT`).

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión de PostgreSQL usada por Prisma |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` / `POSTGRES_PORT` | Usadas por `docker-compose.yml` para levantar Postgres local |
| `JWT_SECRET` | Secreto para firmar y verificar los JWT emitidos en el login. Es obligatorio: si no está definido, la generación de tokens falla. Puede generarse con `openssl rand -hex 32` |
| `PORT` | Puerto HTTP del servidor (opcional, por defecto 3000) |

## Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run build` | Compila el proyecto a `dist/` |
| `npm run start` | Levanta el servidor compilado |
| `npm run start:dev` | Levanta el servidor con hot-reload |
| `npm run start:prod` | Levanta el servidor desde `dist/main.js` |
| `npm test` | Corre la suite de pruebas unitarias (Jest) |
| `npm run test:watch` | Corre las pruebas en modo watch |
| `npm run lint` | Analiza el código con ESLint |
| `npm run lint:fix` | Corrige automáticamente lo que ESLint pueda arreglar |
| `npm run format` | Formatea el código con Prettier |
| `npm run prisma:generate` | Regenera el cliente de Prisma tras cambios en el schema |
| `npm run prisma:validate` | Valida la sintaxis del `schema.prisma` |

## Testing

El proyecto se desarrolló bajo TDD: cada caso de uso tiene su `*.spec.ts` correspondiente, con dobles de prueba para los puertos del dominio; no se prueba contra una base de datos real. Para correr la cobertura:

```bash
npm test -- --coverage
```

## Calidad de código

ESLint 9 (flat config, `eslint.config.mjs`) con el set `recommendedTypeChecked` de `typescript-eslint` y Prettier integrado como regla de lint. En los archivos `*.spec.ts` se desactiva `@typescript-eslint/unbound-method`, ya que genera falsos positivos con el patrón `expect(mock.metodo).toHaveBeenCalledWith(...)` de Jest.

## CI/CD

El pipeline de GitHub Actions (`.github/workflows/ci.yml`) se ejecuta en cada push a `main` y:

1. Instala dependencias (`npm ci`).
2. Corre el linter (`npm run lint`).
3. Corre las pruebas unitarias con cobertura, fallando el build si la cobertura global es menor al 80%.

## Documentación de la API

Ver `API.md` para el detalle de cada endpoint: método, ruta, body, respuesta y errores posibles.

## Limitaciones conocidas

1. La mayoría de las excepciones de dominio no mapean a códigos HTTP correctos. Solo `OperacionNoAutorizadaException` (módulo patients) extiende `ForbiddenException` y responde 403. El resto extiende `Error` plano, por lo que el filtro global las convierte en 500 en vez de 404/409/400.
2. Las entidades de dominio (`Mascota`, `RegistroMedico`, `Cita`) se devuelven directamente desde algunos controladores sin mapear a un DTO de salida. Como sus campos internos están prefijados con guión bajo, el JSON real que recibe el cliente en esos endpoints expone esos nombres en vez de los nombres limpios.
3. Los DTO de entrada son interfaces de TypeScript puras, sin decoradores de `class-validator`, aunque la librería está instalada y el `ValidationPipe` global está configurado. Sin metadata de validación, el pipe no tiene nada que validar.
4. No existe un guard que proteja los endpoints con el JWT emitido en el login.
5. El módulo de notificaciones es simulado: solo escribe en el log de la aplicación, no envía correos reales ni existe un scheduler que lo dispare automáticamente.
6. La prevención de choque de horario depende de una verificación a nivel de aplicación, no de una restricción a nivel de base de datos, por lo que existe una ventana teórica de condición de carrera bajo alta concurrencia.

## Autor

Camacho. Estudiante de Ingeniería de Software (ISW), Sonora, México.
