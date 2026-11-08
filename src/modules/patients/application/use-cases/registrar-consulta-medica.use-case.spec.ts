import { Test, TestingModule } from '@nestjs/testing';
import { RegistrarConsultaMedicaUseCase } from './registrar-consulta-medica.use-case';
import { RegistrarConsultaMedicaDto } from './dto/registrar-consulta-medica.dto';
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
import { Mascota } from '../../domain/entities/mascota.entity';
import { RegistroMedico } from '../../domain/entities/registro-medico.entity';
import {
  MascotaNoEncontradaException,
  OperacionNoAutorizadaException,
} from '../../domain/exceptions';

describe('RegistrarConsultaMedicaUseCase', () => {
  let useCase: RegistrarConsultaMedicaUseCase;
  let registroMedicoRepository: jest.Mocked<RegistroMedicoRepository>;
  let mascotaRepository: jest.Mocked<MascotaRepository>;
  let veterinarioValidator: jest.Mocked<VeterinarioValidator>;

  const dtoBase: RegistrarConsultaMedicaDto = {
    mascotaId: 'mascota-1',
    veterinarioId: 'vet-1',
    diagnostico: 'Otitis leve',
    tratamiento: 'Limpieza y gotas óticas',
    notas: 'Revisar en 10 días',
  };

  const mascotaExistente = new Mascota({
    id: 'mascota-1',
    nombre: 'Firulais',
    especie: 'Perro',
    raza: 'Labrador',
    fechaNacimiento: new Date('2022-01-01'),
    duenioId: 'duenio-1',
  });

  beforeEach(async () => {
    const registroMedicoRepositoryMock: jest.Mocked<RegistroMedicoRepository> =
      {
        save: jest.fn(),
        findByMascotaId: jest.fn(),
      };

    const mascotaRepositoryMock: jest.Mocked<MascotaRepository> = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<MascotaRepository>;

    const veterinarioValidatorMock: jest.Mocked<VeterinarioValidator> = {
      verificar: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrarConsultaMedicaUseCase,
        {
          provide: REGISTRO_MEDICO_REPOSITORY,
          useValue: registroMedicoRepositoryMock,
        },
        { provide: MASCOTA_REPOSITORY, useValue: mascotaRepositoryMock },
        { provide: VETERINARIO_VALIDATOR, useValue: veterinarioValidatorMock },
      ],
    }).compile();

    useCase = module.get(RegistrarConsultaMedicaUseCase);
    registroMedicoRepository = module.get(REGISTRO_MEDICO_REPOSITORY);
    mascotaRepository = module.get(MASCOTA_REPOSITORY);
    veterinarioValidator = module.get(VETERINARIO_VALIDATOR);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('caso 1: registrar consulta médica (éxito)', () => {
    it('debe registrar la consulta cuando la mascota y el veterinario existen', async () => {
      mascotaRepository.findById.mockResolvedValue(mascotaExistente);
      veterinarioValidator.verificar.mockResolvedValue({
        existe: true,
        esVeterinario: true,
      });

      const registroGuardado = new RegistroMedico({
        id: 'registro-1',
        mascotaId: dtoBase.mascotaId,
        veterinarioId: dtoBase.veterinarioId,
        diagnostico: dtoBase.diagnostico,
        tratamiento: dtoBase.tratamiento,
        notas: dtoBase.notas,
      });

      registroMedicoRepository.save.mockResolvedValue(registroGuardado);

      const resultado = await useCase.ejecutar(dtoBase);

      expect(mascotaRepository.findById).toHaveBeenCalledWith(
        dtoBase.mascotaId,
      );
      expect(veterinarioValidator.verificar).toHaveBeenCalledWith(
        dtoBase.veterinarioId,
      );
      expect(registroMedicoRepository.save).toHaveBeenCalledTimes(1);
      expect(registroMedicoRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          mascotaId: dtoBase.mascotaId,
          veterinarioId: dtoBase.veterinarioId,
          diagnostico: dtoBase.diagnostico,
        }),
      );
      expect(resultado).toEqual(registroGuardado);
    });
  });

  describe('caso 2: rechazar si la mascota no existe', () => {
    it('debe lanzar MascotaNoEncontradaException y no debe guardar el registro', async () => {
      mascotaRepository.findById.mockResolvedValue(null);

      await expect(useCase.ejecutar(dtoBase)).rejects.toThrow(
        MascotaNoEncontradaException,
      );

      expect(veterinarioValidator.verificar).not.toHaveBeenCalled();
      expect(registroMedicoRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('caso 3: rechazar si el veterinario no existe', () => {
    it('debe lanzar OperacionNoAutorizadaException y no debe guardar el registro', async () => {
      mascotaRepository.findById.mockResolvedValue(mascotaExistente);
      veterinarioValidator.verificar.mockResolvedValue({
        existe: false,
        esVeterinario: false,
      });

      await expect(useCase.ejecutar(dtoBase)).rejects.toThrow(
        OperacionNoAutorizadaException,
      );

      expect(registroMedicoRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('caso 4: rechazar si el usuario encontrado no es veterinario', () => {
    it('debe lanzar OperacionNoAutorizadaException (mismo error que si no existiera, para no filtrar roles) y no debe guardar el registro', async () => {
      mascotaRepository.findById.mockResolvedValue(mascotaExistente);
      veterinarioValidator.verificar.mockResolvedValue({
        existe: true,
        esVeterinario: false,
      });

      await expect(useCase.ejecutar(dtoBase)).rejects.toThrow(
        OperacionNoAutorizadaException,
      );

      expect(registroMedicoRepository.save).not.toHaveBeenCalled();
    });
  });
});
