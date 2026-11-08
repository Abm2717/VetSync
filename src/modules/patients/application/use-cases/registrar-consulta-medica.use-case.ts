import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  RegistroMedicoRepository,
  REGISTRO_MEDICO_REPOSITORY,
} from '../../domain/repositories/registro-medico.repository';
import {
  MascotaRepository,
  MASCOTA_REPOSITORY,
} from '../../domain/repositories/mascota.repository';
import {
  VeterinarioValidator,
  VETERINARIO_VALIDATOR,
} from '../../domain/services/veterinario-validator';
import { RegistroMedico } from '../../domain/entities/registro-medico.entity';
import {
  MascotaNoEncontradaException,
  OperacionNoAutorizadaException,
} from '../../domain/exceptions';
import { RegistrarConsultaMedicaDto } from './dto/registrar-consulta-medica.dto';

@Injectable()
export class RegistrarConsultaMedicaUseCase {
  private readonly logger = new Logger(RegistrarConsultaMedicaUseCase.name);

  constructor(
    @Inject(REGISTRO_MEDICO_REPOSITORY)
    private readonly registroMedicoRepository: RegistroMedicoRepository,
    @Inject(MASCOTA_REPOSITORY)
    private readonly mascotaRepository: MascotaRepository,
    @Inject(VETERINARIO_VALIDATOR)
    private readonly veterinarioValidator: VeterinarioValidator,
  ) {}

  async ejecutar(dto: RegistrarConsultaMedicaDto): Promise<RegistroMedico> {
    const mascota = await this.mascotaRepository.findById(dto.mascotaId);
    if (!mascota) {
      throw new MascotaNoEncontradaException(dto.mascotaId);
    }

    // Igual que en RegistrarMascotaUseCase: un único error genérico tanto
    // si el veterinarioId no existe como si existe pero no tiene rol
    // VETERINARIO, para no filtrar ids de usuario válidos ni su rol.
    const validacion = await this.veterinarioValidator.verificar(
      dto.veterinarioId,
    );
    if (!validacion.existe) {
      this.logger.warn(
        `Intento de registrar consulta médica con veterinarioId inexistente: ${dto.veterinarioId}`,
      );
      throw new OperacionNoAutorizadaException();
    }
    if (!validacion.esVeterinario) {
      this.logger.warn(
        `Usuario ${dto.veterinarioId} intentó registrar una consulta médica sin tener rol VETERINARIO`,
      );
      throw new OperacionNoAutorizadaException();
    }

    const nuevoRegistro = new RegistroMedico({
      id: randomUUID(),
      mascotaId: dto.mascotaId,
      veterinarioId: dto.veterinarioId,
      diagnostico: dto.diagnostico,
      tratamiento: dto.tratamiento,
      notas: dto.notas,
    });

    return this.registroMedicoRepository.save(nuevoRegistro);
  }
}
