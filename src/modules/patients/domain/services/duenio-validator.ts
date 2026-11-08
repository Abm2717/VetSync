export interface DuenioValidationResult {
  existe: boolean;
  esDuenio: boolean;
}

export interface DuenioValidator {
  verificar(usuarioId: string): Promise<DuenioValidationResult>;
}

export const DUENIO_VALIDATOR = Symbol('DUENIO_VALIDATOR');
