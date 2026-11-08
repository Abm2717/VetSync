import { CancelarCitaUseCase } from './cancelar-cita.use-case';
import { CitaRepository } from '../../domain/repositories/cita.repository';
import { Cita, EstadoCita } from '../../domain/entities/cita.entity';
import {
  CitaNoEncontradaException,
  CitaYaCanceladaException,
  CitaYaFinalizadaException,
} from '../../domain/exceptions';

describe('CancelarCitaUseCase', () => {
  let useCase: CancelarCitaUseCase;
  let citaRepository: jest.Mocked<CitaRepository>;

  const UN_DIA_MS = 24 * 60 * 60 * 1000;

  const crearCita = (
    overrides: Partial<{ id: string; fecha: Date; estado: EstadoCita }> = {},
  ): Cita => {
    return new Cita({
      id: overrides.id ?? 'cita-1',
      mascotaId: 'mascota-1',
      veterinarioId: 'vet-1',
      fecha: overrides.fecha ?? new Date(Date.now() + UN_DIA_MS), // futura por defecto
      estado: overrides.estado ?? EstadoCita.PROGRAMADA,
    });
  };

  beforeEach(() => {
    citaRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<CitaRepository>;

    useCase = new CancelarCitaUseCase(citaRepository);
  });

  it('cancela una cita existente y futura (éxito)', async () => {
    const cita = crearCita();
    citaRepository.findById.mockResolvedValue(cita);
    citaRepository.save.mockResolvedValue(undefined);

    await useCase.ejecutar({ citaId: cita.id });

    expect(citaRepository.findById).toHaveBeenCalledWith(cita.id);
    expect(cita.estado).toBe(EstadoCita.CANCELADA);
    expect(citaRepository.save).toHaveBeenCalledWith(cita);
  });

  it('rechaza la cancelación si la cita no existe', async () => {
    citaRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.ejecutar({ citaId: 'cita-inexistente' }),
    ).rejects.toThrow(CitaNoEncontradaException);

    expect(citaRepository.save).not.toHaveBeenCalled();
  });

  it('rechaza la cancelación si la cita ya pasó', async () => {
    const citaPasada = crearCita({ fecha: new Date(Date.now() - UN_DIA_MS) });
    citaRepository.findById.mockResolvedValue(citaPasada);

    await expect(useCase.ejecutar({ citaId: citaPasada.id })).rejects.toThrow(
      CitaYaFinalizadaException,
    );

    expect(citaRepository.save).not.toHaveBeenCalled();
  });

  it('rechaza la cancelación si la cita ya estaba cancelada previamente', async () => {
    const citaCancelada = crearCita({ estado: EstadoCita.CANCELADA });
    citaRepository.findById.mockResolvedValue(citaCancelada);

    await expect(
      useCase.ejecutar({ citaId: citaCancelada.id }),
    ).rejects.toThrow(CitaYaCanceladaException);

    expect(citaRepository.save).not.toHaveBeenCalled();
  });
});
