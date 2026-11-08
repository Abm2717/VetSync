# VetSync - Documentación Técnica de la API

## Información general

| | |
|---|---|
| Base URL | `http://localhost:3000` (configurable con `PORT`) |
| Prefijo global | Ninguno |
| Formato | JSON (`Content-Type: application/json`) |
| Autenticación | `POST /identity/login` emite un JWT (HS256, expira en 1 hora). Actualmente ningún endpoint valida ese token con un guard. |

## Formato de error estándar

El filtro global (`HttpExceptionFilter`) responde todos los errores con esta forma:

```json
{
  "statusCode": 500,
  "timestamp": "2026-11-08T21:00:00.000Z",
  "path": "/scheduling/citas",
  "message": "Internal server error"
}
```

Si la excepción lanzada extiende `HttpException` de NestJS (por ejemplo `ForbiddenException`), `statusCode` y `message` reflejan el error real. Si la excepción es un `Error` plano, el filtro la convierte en 500 con el mensaje genérico "Internal server error"; el detalle real queda solo en el log del servidor.

## Catálogo de excepciones de dominio y código HTTP real

| Excepción | Módulo | Extiende | Status real devuelto hoy |
|---|---|---|---|
| `EmailYaRegistradoException` | identity | `Error` | 500 |
| `RolInvalidoException` | identity | `Error` | 500 |
| `CredencialesInvalidasException` | identity | `Error` | 500 |
| `MascotaNoEncontradaException` | patients / scheduling | `Error` | 500 |
| `OperacionNoAutorizadaException` | patients | `ForbiddenException` | 403 |
| `CitaNoEncontradaException` | scheduling | `Error` | 500 |
| `CitaYaCanceladaException` | scheduling | `Error` | 500 |
| `CitaYaFinalizadaException` | scheduling | `Error` | 500 |
| `FechaPasadaException` | scheduling | `Error` | 500 |
| `HorarioOcupadoException` | scheduling | `Error` | 500 |
| `VeterinarioNoEncontradoException` | scheduling | `Error` | 500 |

`OperacionNoAutorizadaException` es, por diseño, un mensaje genérico y deliberadamente ambiguo: se usa tanto cuando el `duenioId`/`veterinarioId` no existe como cuando existe pero tiene el rol incorrecto, para no permitir enumerar ids de usuario válidos desde afuera.

## Módulo: Identity (/identity)

### POST /identity/registro

Registra un nuevo usuario (dueño de mascota o veterinario).

Body:
```json
{
  "email": "ana@example.com",
  "password": "contraseña-en-texto-plano",
  "nombre": "Ana Pérez",
  "rol": "OWNER"
}
```
`rol` acepta `"OWNER"` o `"VETERINARIO"`.

Respuesta exitosa, 201 Created:
```json
{
  "id": "f3b1...",
  "nombre": "Ana Pérez",
  "email": "ana@example.com",
  "rol": "OWNER"
}
```

Errores posibles:

| Causa | Excepción | Status real |
|---|---|---|
| El email ya está registrado | `EmailYaRegistradoException` | 500 |
| `rol` no es `OWNER` ni `VETERINARIO` | `RolInvalidoException` | 500 |

### POST /identity/login

Autentica un usuario y emite un JWT.

Body:
```json
{
  "email": "ana@example.com",
  "password": "contraseña-en-texto-plano"
}
```

Respuesta exitosa, 200 OK:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```
Token firmado HS256, expira en 1 hora, payload `{ sub: <usuarioId> }`.

Errores posibles:

| Causa | Excepción | Status real |
|---|---|---|
| Email no existe, password incorrecto, o cuenta sin password almacenado | `CredencialesInvalidasException` | 500 |

## Módulo: Patients (/patients)

### POST /patients/mascotas

Registra una mascota asociada a un dueño existente.

Body:
```json
{
  "nombre": "Firulais",
  "especie": "Perro",
  "raza": "Labrador",
  "fechaNacimiento": "2022-03-10T00:00:00.000Z",
  "duenioId": "f3b1..."
}
```

Respuesta exitosa, 201 Created. Este endpoint devuelve la entidad `Mascota` directamente, sin mapear a un DTO de salida; el cuerpo real usa los nombres internos de la entidad:
```json
{
  "_id": "a7c2...",
  "_nombre": "Firulais",
  "_especie": "Perro",
  "_raza": "Labrador",
  "_fechaNacimiento": "2022-03-10T00:00:00.000Z",
  "_duenioId": "f3b1..."
}
```

Errores posibles:

| Causa | Excepción | Status real |
|---|---|---|
| `duenioId` no existe, o existe pero no tiene rol `OWNER` | `OperacionNoAutorizadaException` | 403 |

### POST /patients/historial-medico

Registra una consulta médica sobre una mascota existente.

Body:
```json
{
  "mascotaId": "a7c2...",
  "veterinarioId": "9df0...",
  "diagnostico": "Otitis leve",
  "tratamiento": "Gotas óticas por 7 días",
  "notas": "Revisión de control en 2 semanas"
}
```
`tratamiento` y `notas` son opcionales.

Respuesta exitosa, 201 Created. Devuelve la entidad `RegistroMedico` sin mapear:
```json
{
  "_id": "d4e5...",
  "_mascotaId": "a7c2...",
  "_veterinarioId": "9df0...",
  "_diagnostico": "Otitis leve",
  "_tratamiento": "Gotas óticas por 7 días",
  "_notas": "Revisión de control en 2 semanas",
  "_fecha": "2026-11-08T21:00:00.000Z"
}
```

Errores posibles:

| Causa | Excepción | Status real |
|---|---|---|
| `mascotaId` no existe | `MascotaNoEncontradaException` | 500 |
| `veterinarioId` no existe, o existe pero no tiene rol `VETERINARIO` | `OperacionNoAutorizadaException` | 403 |

### GET /patients/mascotas/:mascotaId/historial-medico

Lista el historial médico completo de una mascota.

Respuesta exitosa, 200 OK. Array de entidades `RegistroMedico` sin mapear:
```json
[
  {
    "_id": "d4e5...",
    "_mascotaId": "a7c2...",
    "_veterinarioId": "9df0...",
    "_diagnostico": "Otitis leve",
    "_tratamiento": "Gotas óticas por 7 días",
    "_notas": "Revisión de control en 2 semanas",
    "_fecha": "2026-11-08T21:00:00.000Z"
  }
]
```

Errores posibles:

| Causa | Excepción | Status real |
|---|---|---|
| `mascotaId` no existe | `MascotaNoEncontradaException` | 500 |

## Módulo: Scheduling (/scheduling)

### POST /scheduling/citas

Agenda una cita entre una mascota y un veterinario.

Body:
```json
{
  "mascotaId": "a7c2...",
  "veterinarioId": "9df0...",
  "fechaHora": "2026-12-01T15:00:00.000Z"
}
```

Respuesta exitosa, 201 Created. Devuelve la entidad `Cita` sin mapear:
```json
{
  "_id": "c91a...",
  "_mascotaId": "a7c2...",
  "_veterinarioId": "9df0...",
  "_fecha": "2026-12-01T15:00:00.000Z",
  "_estado": "PROGRAMADA"
}
```
`_estado` es uno de: `"PROGRAMADA"`, `"CANCELADA"`, `"COMPLETADA"`.

Errores posibles:

| Causa | Excepción | Status real |
|---|---|---|
| `fechaHora` está en el pasado o es el momento actual | `FechaPasadaException` | 500 |
| `mascotaId` no existe | `MascotaNoEncontradaException` | 500 |
| `veterinarioId` no existe | `VeterinarioNoEncontradoException` | 500 |
| El veterinario ya tiene otra cita a esa misma hora | `HorarioOcupadoException` | 500 |

### PATCH /scheduling/citas/:citaId/cancelar

Cancela una cita existente. Sin body.

Respuesta exitosa, 200 OK:
```json
{
  "citaId": "c91a...",
  "cancelada": true
}
```
Este endpoint construye manualmente la respuesta; no presenta el problema de serialización de los anteriores.

Errores posibles:

| Causa | Excepción | Status real |
|---|---|---|
| `citaId` no existe | `CitaNoEncontradaException` | 500 |
| La cita ya estaba cancelada | `CitaYaCanceladaException` | 500 |
| La cita ya ocurrió | `CitaYaFinalizadaException` | 500 |

### PATCH /scheduling/citas/:citaId/reagendar

Mueve una cita existente a una nueva fecha y hora.

Body:
```json
{
  "nuevaFecha": "2026-12-05T10:00:00.000Z"
}
```

Respuesta exitosa, 200 OK. Devuelve la entidad `Cita` sin mapear:
```json
{
  "_id": "c91a...",
  "_mascotaId": "a7c2...",
  "_veterinarioId": "9df0...",
  "_fecha": "2026-12-05T10:00:00.000Z",
  "_estado": "PROGRAMADA"
}
```

Errores posibles:

| Causa | Excepción | Status real |
|---|---|---|
| `citaId` no existe | `CitaNoEncontradaException` | 500 |
| La cita ya estaba cancelada | `CitaYaCanceladaException` | 500 |
| `nuevaFecha` está en el pasado | `FechaPasadaException` | 500 |
| El veterinario ya tiene otra cita en la nueva fecha y hora | `HorarioOcupadoException` | 500 |

## Módulo: Notifications (/notifications)

### POST /notifications/citas/:citaId/recordatorio

Dispara manualmente el envío simulado de un recordatorio de cita por correo. No envía un correo real; únicamente registra el intento en el log de la aplicación.

Sin body.

Respuesta exitosa, 201 Created:
```json
{
  "citaId": "c91a...",
  "enviado": true
}
```

Si la cita, la mascota o el dueño asociados no pueden resolverse, el caso de uso no lanza ningún error: no hace nada y el endpoint responde `enviado: true` de todas formas, sin que se haya enviado nada en realidad. No hay errores documentados para este endpoint porque el caso de uso los absorbe silenciosamente.
