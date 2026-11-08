import { Test } from '@nestjs/testing';
import { ReagendarCitaUseCase } from './reagendar-cita.use-case';
import {
  CitaRepository,
  CITA_REPOSITORY,
} from '../../domain/repositories/cita.repository';
import { Cita, EstadoCita } from '../../domain/entities/cita.entity';
import {
  CitaNoEncontradaException,
  FechaPasadaException,
  HorarioOcupadoException,
} from '../../domain/exceptions';

describe('ReagendarCitaUseCase', () => {
  let useCase: ReagendarCitaUseCase;
  let citaRepository: jest.Mocked<CitaRepository>;

  const crearCitaExistente = (): Cita =>
    new Cita({
      id: 'cita-1',
      mascotaId: 'mascota-1',
      veterinarioId: 'vet-1',
      fecha: new Date('2026-12-01T10:00:00Z'),
      estado: EstadoCita.PROGRAMADA,
    });

  beforeEach(async () => {
    const mockRepository: jest.Mocked<CitaRepository> = {
      findById: jest.fn(),
      findByVeterinarioYHorario: jest.fn(),
      existeConflictoHorario: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<CitaRepository>;

    const moduleRef = await Test.createTestingModule({
      providers: [
        ReagendarCitaUseCase,
        { provide: CITA_REPOSITORY, useValue: mockRepository },
      ],
    }).compile();

    useCase = moduleRef.get(ReagendarCitaUseCase);
    citaRepository = moduleRef.get(CITA_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('1. reagenda la cita cuando el nuevo horario está libre', async () => {
    const citaExistente = crearCitaExistente();
    const nuevaFecha = new Date('2026-12-02T15:00:00Z');

    citaRepository.findById.mockResolvedValue(citaExistente);
    citaRepository.existeConflictoHorario.mockResolvedValue(false);
    citaRepository.save.mockResolvedValue(undefined);

    const resultado = await useCase.ejecutar({
      citaId: citaExistente.id,
      nuevaFecha,
    });

    expect(citaRepository.findById).toHaveBeenCalledWith(citaExistente.id);
    expect(citaRepository.existeConflictoHorario).toHaveBeenCalledWith(
      citaExistente.veterinarioId,
      nuevaFecha,
      citaExistente.id,
    );
    expect(citaRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: citaExistente.id, fecha: nuevaFecha }),
    );
    expect(resultado.fecha).toEqual(nuevaFecha);
  });

  it('2. rechaza si la cita original no existe', async () => {
    citaRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.ejecutar({
        citaId: 'cita-inexistente',
        nuevaFecha: new Date('2026-12-02T15:00:00Z'),
      }),
    ).rejects.toThrow(CitaNoEncontradaException);

    expect(citaRepository.save).not.toHaveBeenCalled();
  });

  it('3. rechaza si el nuevo horario ya pasó', async () => {
    citaRepository.findById.mockResolvedValue(crearCitaExistente());

    const fechaPasada = new Date('2000-01-01T10:00:00Z');

    await expect(
      useCase.ejecutar({
        citaId: 'cita-1',
        nuevaFecha: fechaPasada,
      }),
    ).rejects.toThrow(FechaPasadaException);

    expect(citaRepository.existeConflictoHorario).not.toHaveBeenCalled();
    expect(citaRepository.save).not.toHaveBeenCalled();
  });

  it('4. rechaza si el veterinario ya tiene otra cita en el nuevo horario', async () => {
    const citaExistente = crearCitaExistente();
    const nuevaFecha = new Date('2026-12-02T15:00:00Z');

    citaRepository.findById.mockResolvedValue(citaExistente);
    citaRepository.existeConflictoHorario.mockResolvedValue(true);

    await expect(
      useCase.ejecutar({
        citaId: citaExistente.id,
        nuevaFecha,
      }),
    ).rejects.toThrow(HorarioOcupadoException);

    expect(citaRepository.save).not.toHaveBeenCalled();
  });
});
