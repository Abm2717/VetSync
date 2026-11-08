export interface MascotaValidator {
  existe(mascotaId: string): Promise<boolean>;
}

export const MASCOTA_VALIDATOR = Symbol('MASCOTA_VALIDATOR');
