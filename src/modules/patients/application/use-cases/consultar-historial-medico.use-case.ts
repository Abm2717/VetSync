import { Inject, Injectable } from '@nestjs/common';
import {
  RegistroMedicoRepository,
  REGISTRO_MEDICO_REPOSITORY,
} from '../../domain/repositories/registro-medico.repository';
import {
  MascotaRepository,
  MASCOTA_REPOSITORY,
} from '../../domain/repositories/mascota.repository';
import { RegistroMedico } from '../../domain/entities/registro-medico.entity';
import { MascotaNoEncontradaException } from '../../domain/exceptions';

@Injectable()
export class ConsultarHistorialMedicoUseCase {
  constructor(
    @Inject(REGISTRO_MEDICO_REPOSITORY)
    private readonly registroMedicoRepository: RegistroMedicoRepository,
    @Inject(MASCOTA_REPOSITORY)
    private readonly mascotaRepository: MascotaRepository,
  ) {}

  async ejecutar(mascotaId: string): Promise<RegistroMedico[]> {
    const mascota = await this.mascotaRepository.findById(mascotaId);
    if (!mascota) {
      throw new MascotaNoEncontradaException(mascotaId);
    }

    return this.registroMedicoRepository.findByMascotaId(mascotaId);
  }
}
