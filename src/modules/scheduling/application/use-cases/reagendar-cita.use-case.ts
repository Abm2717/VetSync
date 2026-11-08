import { Inject, Injectable } from '@nestjs/common';
import {
  CitaRepository,
  CITA_REPOSITORY,
} from '../../domain/repositories/cita.repository';
import { Cita } from '../../domain/entities/cita.entity';
import {
  CitaNoEncontradaException,
  HorarioOcupadoException,
} from '../../domain/exceptions';

export interface ReagendarCitaDto {
  citaId: string;
  nuevaFecha: Date;
}

/**
 * Caso de uso: reagendar una cita existente a una nueva fecha.
 * Responsabilidad única: orquestar la búsqueda, validar el choque de horario
 * (requiere el repositorio, por eso vive aquí y no en la entidad), delegar
 * la validación de fecha pasada / cita cancelada a Cita.reagendar(), y
 * persistir el resultado.
 */
@Injectable()
export class ReagendarCitaUseCase {
  constructor(
    @Inject(CITA_REPOSITORY)
    private readonly citaRepository: CitaRepository,
  ) {}

  async ejecutar(dto: ReagendarCitaDto): Promise<Cita> {
    const cita = await this.citaRepository.findById(dto.citaId);

    if (!cita) {
      throw new CitaNoEncontradaException(dto.citaId);
    }

    // La regla de "fecha pasada" / "cita cancelada" vive en la entidad.
    // Pero el choque de horario con OTRAS citas necesita el repositorio,
    // así que se valida aquí, antes de mutar la entidad.
    cita.reagendar(dto.nuevaFecha);

    const hayConflicto = await this.citaRepository.existeConflictoHorario(
      cita.veterinarioId,
      dto.nuevaFecha,
      cita.id,
    );
    if (hayConflicto) {
      throw new HorarioOcupadoException();
    }

    await this.citaRepository.save(cita);
    return cita;
  }
}
