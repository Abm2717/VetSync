export interface TokenGenerator {
  generar(usuarioId: string): string;
}

export const TOKEN_GENERATOR = Symbol('TOKEN_GENERATOR');
