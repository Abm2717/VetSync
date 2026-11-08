import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { TokenGenerator } from '../domain/services/token-generator';

const EXPIRACION = '1h';

/**
 * Genera tokens de sesión como JWT firmados con HMAC (HS256).
 *
 * Reemplaza una implementación anterior que concatenaba bytes aleatorios
 * con el id de usuario en texto plano (`randomHex.usuarioId`): esa cadena
 * no estaba criptográficamente ligada al id, así que cualquiera podía
 * forjar un token válido para suplantar a cualquier usuario simplemente
 * generando 64 hex chars y pegando el id de la víctima. Un JWT firmado
 * no puede alterarse ni forjarse sin conocer JWT_SECRET, y además expira.
 */
@Injectable()
export class JwtTokenGenerator implements TokenGenerator {
  generar(usuarioId: string): string {
    const secret = this.obtenerSecreto();
    return jwt.sign({ sub: usuarioId }, secret, { expiresIn: EXPIRACION });
  }

  private obtenerSecreto(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error(
        'JWT_SECRET no está configurado. Defínelo en el archivo .env antes de generar tokens.',
      );
    }
    return secret;
  }
}
