export interface PasswordHasher {
  hashear(passwordPlano: string): Promise<string>;
  comparar(passwordPlano: string, passwordHash: string): Promise<boolean>;
}

export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');
