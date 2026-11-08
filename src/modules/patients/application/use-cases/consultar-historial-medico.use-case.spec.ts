import { Test, TestingModule } from '@nestjs/testing';
import { ConsultarHistorialMedicoUseCase } from './consultar-historial-medico.use-case';
import {
  RegistroMedicoRepository,
  REGISTRO_MEDICO_REPOSITORY,
} from '../../domain/repositories/registro-medico.repository';
import {
  MascotaRepository,
  MASCOTA_REPOSITORY,
} from '../../domain/repositories/mascota.repository';
import { Mascota } from '../../domain/entities/mascota.entity';
import { RegistroMedico } from '../../domain/entities/registro-medico.entity';
import { MascotaNoEncontradaException } from '../../domain/exceptions';

describe('ConsultarHistorialMedicoUseCase', () => {
  let useCase: ConsultarHistorialMedicoUseCase;
  let registroMedicoRepository: jest.Mocked<RegistroMedicoRepository>;
  let mascotaRepository: jest.Mocked<MascotaRepository>;

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
      } as unknown as jest.Mocked<RegistroMedicoRepository>;

    const mascotaRepositoryMock: jest.Mocked<MascotaRepository> = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<MascotaRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsultarHistorialMedicoUseCase,
        {
          provide: REGISTRO_MEDICO_REPOSITORY,
          useValue: registroMedicoRepositoryMock,
        },
        { provide: MASCOTA_REPOSITORY, useValue: mascotaRepositoryMock },
      ],
    }).compile();

    useCase = module.get(ConsultarHistorialMedicoUseCase);
    registroMedicoRepository = module.get(REGISTRO_MEDICO_REPOSITORY);
    mascotaRepository = module.get(MASCOTA_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('caso 1: consultar historial con registros existentes', () => {
    it('debe retornar los registros médicos de la mascota', async () => {
      const registros = [
        new RegistroMedico({
          id: 'registro-1',
          mascotaId: mascotaExistente.id,
          veterinarioId: 'vet-1',
          diagnostico: 'Otitis leve',
        }),
      ];

      mascotaRepository.findById.mockResolvedValue(mascotaExistente);
      registroMedicoRepository.findByMascotaId.mockResolvedValue(registros);

      const resultado = await useCase.ejecutar(mascotaExistente.id);

      expect(mascotaRepository.findById).toHaveBeenCalledWith(
        mascotaExistente.id,
      );
      expect(registroMedicoRepository.findByMascotaId).toHaveBeenCalledWith(
        mascotaExistente.id,
      );
      expect(resultado).toEqual(registros);
    });
  });

  describe('caso 2: rechazar si la mascota no existe', () => {
    it('debe lanzar MascotaNoEncontradaException', async () => {
      mascotaRepository.findById.mockResolvedValue(null);

      await expect(useCase.ejecutar('mascota-inexistente')).rejects.toThrow(
        MascotaNoEncontradaException,
      );

      expect(registroMedicoRepository.findByMascotaId).not.toHaveBeenCalled();
    });
  });
});
