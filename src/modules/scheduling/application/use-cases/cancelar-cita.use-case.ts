import { Inject, Injectable } from '@nestjs/common';
import {
  CitaRepository,
  CITA_REPOSITORY,
} from '../../domain/repositories/cita.repository';
import { CitaNoEncontradaException } from '../../domain/exceptions';

export interface CancelarCitaDto {
  citaId: string;
}

/**
 * Caso de uso: cancelar una cita.
 * Responsabilidad única: orquestar la búsqueda, delegar la regla de negocio
 * a la entidad y persistir el resultado. Las reglas de "ya pasó" / "ya estaba
 * cancelada" viven en Cita.cancelar(), no aquí (SRP).
 */
@Injectable()
export class CancelarCitaUseCase {
  constructor(
    @Inject(CITA_REPOSITORY)
    private readonly citaRepository: CitaRepository,
  ) {}

  async ejecutar(dto: CancelarCitaDto): Promise<void> {
    const cita = await this.citaRepository.findById(dto.citaId);

    if (!cita) {
      throw new CitaNoEncontradaException(dto.citaId);
    }

    cita.cancelar();

    await this.citaRepository.save(cita);
  }
}
