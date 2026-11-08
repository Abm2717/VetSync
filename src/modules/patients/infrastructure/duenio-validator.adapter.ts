import { Inject, Injectable } from '@nestjs/common';
import {
  UsuarioRepository,
  USUARIO_REPOSITORY,
} from '../../identity/domain/repositories/usuario.repository';
import {
  DuenioValidator,
  DuenioValidationResult,
} from '../domain/services/duenio-validator';

@Injectable()
export class DuenioValidatorAdapter implements DuenioValidator {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async verificar(usuarioId: string): Promise<DuenioValidationResult> {
    const usuario = await this.usuarioRepository.findById(usuarioId);

    if (!usuario) {
      return { existe: false, esDuenio: false };
    }

    return { existe: true, esDuenio: usuario.esDuenio() };
  }
}
