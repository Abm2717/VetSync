import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PasswordHasher } from '../domain/services/password-hasher';

const SALT_ROUNDS = 10;

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  async hashear(passwordPlano: string): Promise<string> {
    return bcrypt.hash(passwordPlano, SALT_ROUNDS);
  }

  async comparar(
    passwordPlano: string,
    passwordHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(passwordPlano, passwordHash);
  }
}
