import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { TokenGenerator } from '../domain/services/token-generator';

@Injectable()
export class CryptoTokenGenerator implements TokenGenerator {
  generar(usuarioId: string): string {
    return `${randomBytes(32).toString('hex')}.${usuarioId}`;
  }
}
