import { ForbiddenException } from '@nestjs/common';

export class MascotaNoEncontradaException extends Error {
  constructor(mascotaId: string) {
    super(`No se encontró la mascota con id "${mascotaId}".`);
    this.name = 'MascotaNoEncontradaException';
  }
}

/**
 * Error genérico para cualquier fallo de validación de rol sobre un
 * usuario (dueño o veterinario): tanto si el usuario no existe como si
 * existe pero no tiene el rol requerido.
 *
 * Deliberadamente NO distingue "no existe" de "existe pero rol inválido"
 * de cara al cliente: un atacante que prueba ids podría usar esa
 * diferencia para enumerar qué ids son válidos y qué rol tiene cada uno,
 * sin necesitar autenticarse. La causa específica se loguea solo
 * internamente desde el caso de uso que la detecta.
 */
export class OperacionNoAutorizadaException extends ForbiddenException {
  constructor() {
    super('No tienes permisos para realizar esta operación.');
    this.name = 'OperacionNoAutorizadaException';
  }
}
