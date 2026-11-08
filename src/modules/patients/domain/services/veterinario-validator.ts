export interface VeterinarioValidationResult {
  existe: boolean;
  esVeterinario: boolean;
}

export interface VeterinarioValidator {
  verificar(usuarioId: string): Promise<VeterinarioValidationResult>;
}

export const VETERINARIO_VALIDATOR = Symbol('VETERINARIO_VALIDATOR');
