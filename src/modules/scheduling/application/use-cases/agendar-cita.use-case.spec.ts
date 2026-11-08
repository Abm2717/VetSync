import { Test, TestingModule } from '@nestjs/testing';
import { AgendarCitaUseCase } from './agendar-cita.use-case';
import {
  CITA_REPOSITORY,
  CitaRepository,
} from '../../domain/repositories/cita.repository';
import {
  MASCOTA_VALIDATOR,
  MascotaValidator,
} from '../../domain/services/mascota-validator';
import {
  VETERINARIO_VALIDATOR,
  VeterinarioValidator,
} from '../../domain/services/veterinario-validator';
import { AgendarCitaDto } from './dto/agendar-cita.dto';
import {
  FechaPasadaException,
  HorarioOcupadoException,
  MascotaNoEncontradaException,
  VeterinarioNoEncontradoException,
} from '../../domain/exceptions';

describe('AgendarCitaUseCase', () => {
  let useCase: AgendarCitaUseCase;
  let citaRepository: jest.Mocked<CitaRepository>;
  let mascotaValidator: jest.Mocked<MascotaValidator>;
  let veterinarioValidator: jest.Mocked<VeterinarioValidator>;

  const mascotaId = 'mascota-1';
  const veterinarioId = 'vet-1';

  // Fecha fija en el futuro para evitar flakiness en los tests
  const fechaFutura = new Date(Date.now() + 1000 * 60 * 60 * 24); // mañana
  const fechaPasada = new Date(Date.now() - 1000 * 60 * 60 * 24); // ayer

  beforeEach(async () => {
    const citaRepositoryMock: jest.Mocked<CitaRepository> = {
      findByVeterinarioYHorario: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<CitaRepository>;

    const mascotaValidatorMock: jest.Mocked<MascotaValidator> = {
      existe: jest.fn(),
    } as unknown as jest.Mocked<MascotaValidator>;

    const veterinarioValidatorMock: jest.Mocked<VeterinarioValidator> = {
      existe: jest.fn(),
    } as unknown as jest.Mocked<VeterinarioValidator>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgendarCitaUseCase,
        { provide: CITA_REPOSITORY, useValue: citaRepositoryMock },
        { provide: MASCOTA_VALIDATOR, useValue: mascotaValidatorMock },
        { provide: VETERINARIO_VALIDATOR, useValue: veterinarioValidatorMock },
      ],
    }).compile();

    useCase = module.get(AgendarCitaUseCase);
    citaRepository = module.get(CITA_REPOSITORY);
    mascotaValidator = module.get(MASCOTA_VALIDATOR);
    veterinarioValidator = module.get(VETERINARIO_VALIDATOR);
  });

  it('1. debería agendar la cita cuando el horario está libre', async () => {
    const dto: AgendarCitaDto = {
      mascotaId,
      veterinarioId,
      fechaHora: fechaFutura,
    };

    mascotaValidator.existe.mockResolvedValue(true);
    veterinarioValidator.existe.mockResolvedValue(true);
    citaRepository.findByVeterinarioYHorario.mockResolvedValue(null);
    citaRepository.save.mockResolvedValue(undefined);

    const resultado = await useCase.ejecutar(dto);

    expect(resultado).toBeDefined();
    expect(resultado.mascotaId).toBe(mascotaId);
    expect(resultado.veterinarioId).toBe(veterinarioId);
    expect(citaRepository.save).toHaveBeenCalledTimes(1);
  });

  it('2. debería rechazar la cita si el veterinario ya tiene una cita en ese horario', async () => {
    const dto: AgendarCitaDto = {
      mascotaId,
      veterinarioId,
      fechaHora: fechaFutura,
    };

    mascotaValidator.existe.mockResolvedValue(true);
    veterinarioValidator.existe.mockResolvedValue(true);
    citaRepository.findByVeterinarioYHorario.mockResolvedValue({
      id: 'cita-existente',
      veterinarioId,
      fechaHora: fechaFutura,
    } as any);

    await expect(useCase.ejecutar(dto)).rejects.toThrow(
      HorarioOcupadoException,
    );
    expect(citaRepository.save).not.toHaveBeenCalled();
  });

  it('3. debería rechazar la cita si la fecha es pasada', async () => {
    const dto: AgendarCitaDto = {
      mascotaId,
      veterinarioId,
      fechaHora: fechaPasada,
    };

    await expect(useCase.ejecutar(dto)).rejects.toThrow(FechaPasadaException);
    expect(citaRepository.save).not.toHaveBeenCalled();
    expect(citaRepository.findByVeterinarioYHorario).not.toHaveBeenCalled();
  });

  it('4. debería rechazar la cita si la mascota no existe', async () => {
    const dto: AgendarCitaDto = {
      mascotaId,
      veterinarioId,
      fechaHora: fechaFutura,
    };

    mascotaValidator.existe.mockResolvedValue(false);
    veterinarioValidator.existe.mockResolvedValue(true);

    await expect(useCase.ejecutar(dto)).rejects.toThrow(
      MascotaNoEncontradaException,
    );
    expect(citaRepository.save).not.toHaveBeenCalled();
  });

  it('5. debería rechazar la cita si el veterinario no existe', async () => {
    const dto: AgendarCitaDto = {
      mascotaId,
      veterinarioId,
      fechaHora: fechaFutura,
    };

    mascotaValidator.existe.mockResolvedValue(true);
    veterinarioValidator.existe.mockResolvedValue(false);

    await expect(useCase.ejecutar(dto)).rejects.toThrow(
      VeterinarioNoEncontradoException,
    );
    expect(citaRepository.save).not.toHaveBeenCalled();
  });
});
