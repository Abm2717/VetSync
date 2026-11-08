import { Inject, Injectable } from '@nestjs/common';
import {
  UsuarioRepository,
  USUARIO_REPOSITORY,
} from '../../identity/domain/repositories/usuario.repository';
import { VeterinarioValidator } from '../domain/services/veterinario-validator';

@Injectable()
export class VeterinarioValidatorAdapter implements VeterinarioValidator {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async existe(veterinarioId: string): Promise<boolean> {
    const veterinario = await this.usuarioRepository.findById(veterinarioId);
    return !!veterinario;
  }
}
