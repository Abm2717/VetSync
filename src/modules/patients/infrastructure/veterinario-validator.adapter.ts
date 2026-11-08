import { Inject, Injectable } from '@nestjs/common';
import {
  UsuarioRepository,
  USUARIO_REPOSITORY,
} from '../../identity/domain/repositories/usuario.repository';
import {
  VeterinarioValidator,
  VeterinarioValidationResult,
} from '../domain/services/veterinario-validator';

@Injectable()
export class VeterinarioValidatorAdapter implements VeterinarioValidator {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async verificar(usuarioId: string): Promise<VeterinarioValidationResult> {
    const usuario = await this.usuarioRepository.findById(usuarioId);

    if (!usuario) {
      return { existe: false, esVeterinario: false };
    }

    return { existe: true, esVeterinario: usuario.esVeterinario() };
  }
}
