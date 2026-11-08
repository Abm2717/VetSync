export interface VeterinarioValidator {
  existe(veterinarioId: string): Promise<boolean>;
}

export const VETERINARIO_VALIDATOR = Symbol('VETERINARIO_VALIDATOR');
