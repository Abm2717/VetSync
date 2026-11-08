import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { Cita } from '../../domain/entities/cita.entity';
import {
  CITA_REPOSITORY,
  CitaRepository,
} from '../../domain/repositories/cita.repository';
import {
  FechaPasadaException,
  HorarioOcupadoException,
  MascotaNoEncontradaException,
  VeterinarioNoEncontradoException,
} from '../../domain/exceptions';
import {
  MascotaValidator,
  MASCOTA_VALIDATOR,
} from '../../domain/services/mascota-validator';
import {
  VeterinarioValidator,
  VETERINARIO_VALIDATOR,
} from '../../domain/services/veterinario-validator';
import { AgendarCitaDto } from './dto/agendar-cita.dto';

@Injectable()
export class AgendarCitaUseCase {
  constructor(
    @Inject(CITA_REPOSITORY)
    private readonly citaRepository: CitaRepository,
    @Inject(MASCOTA_VALIDATOR)
    private readonly mascotaValidator: MascotaValidator,
    @Inject(VETERINARIO_VALIDATOR)
    private readonly veterinarioValidator: VeterinarioValidator,
  ) {}

  async ejecutar(dto: AgendarCitaDto): Promise<Cita> {
    this.validarFechaFutura(dto.fechaHora);

    // Ambas lecturas son independientes entre sí, así que se piden en
    // paralelo en vez de secuencialmente: reduce la latencia sin cambiar
    // el resultado (ninguna depende del resultado de la otra).
    const [mascotaExiste, veterinarioExiste] = await Promise.all([
      this.mascotaValidator.existe(dto.mascotaId),
      this.veterinarioValidator.existe(dto.veterinarioId),
    ]);

    if (!mascotaExiste) {
      throw new MascotaNoEncontradaException(dto.mascotaId);
    }
    if (!veterinarioExiste) {
      throw new VeterinarioNoEncontradoException(dto.veterinarioId);
    }

    await this.validarHorarioDisponible(dto.veterinarioId, dto.fechaHora);

    const nuevaCita = new Cita({
      id: randomUUID(),
      mascotaId: dto.mascotaId,
      veterinarioId: dto.veterinarioId,
      fecha: dto.fechaHora,
    });

    await this.citaRepository.save(nuevaCita);
    return nuevaCita;
  }

  private validarFechaFutura(fechaHora: Date): void {
    if (fechaHora.getTime() <= Date.now()) {
      throw new FechaPasadaException();
    }
  }

  private async validarHorarioDisponible(
    veterinarioId: string,
    fechaHora: Date,
  ): Promise<void> {
    const citaExistente = await this.citaRepository.findByVeterinarioYHorario(
      veterinarioId,
      fechaHora,
    );
    if (citaExistente) {
      throw new HorarioOcupadoException();
    }
  }
}
