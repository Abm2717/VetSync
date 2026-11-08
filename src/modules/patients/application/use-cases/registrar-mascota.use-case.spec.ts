import { Test, TestingModule } from '@nestjs/testing';
import { RegistrarMascotaUseCase } from './registrar-mascota.use-case';
import { RegistrarMascotaDto } from './dto/registrar-mascota.dto';
import {
  MascotaRepository,
  MASCOTA_REPOSITORY,
} from '../../domain/repositories/mascota.repository';
import {
  DuenioValidator,
  DUENIO_VALIDATOR,
} from '../../domain/services/duenio-validator';
import { Mascota } from '../../domain/entities/mascota.entity';
import { OperacionNoAutorizadaException } from '../../domain/exceptions';

describe('RegistrarMascotaUseCase', () => {
  let useCase: RegistrarMascotaUseCase;
  let mascotaRepository: jest.Mocked<MascotaRepository>;
  let duenioValidator: jest.Mocked<DuenioValidator>;

  const dtoBase: RegistrarMascotaDto = {
    nombre: 'Firulais',
    especie: 'Perro',
    raza: 'Labrador',
    fechaNacimiento: new Date('2022-05-10'),
    duenioId: 'duenio-123',
  };

  beforeEach(async () => {
    const mascotaRepositoryMock: jest.Mocked<MascotaRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<MascotaRepository>;

    const duenioValidatorMock: jest.Mocked<DuenioValidator> = {
      verificar: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrarMascotaUseCase,
        { provide: MASCOTA_REPOSITORY, useValue: mascotaRepositoryMock },
        { provide: DUENIO_VALIDATOR, useValue: duenioValidatorMock },
      ],
    }).compile();

    useCase = module.get<RegistrarMascotaUseCase>(RegistrarMascotaUseCase);
    mascotaRepository = module.get(MASCOTA_REPOSITORY);
    duenioValidator = module.get(DUENIO_VALIDATOR);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('caso 1: registrar mascota con un dueño existente (éxito)', () => {
    it('debe registrar la mascota cuando el dueño existe y su rol es OWNER', async () => {
      duenioValidator.verificar.mockResolvedValue({
        existe: true,
        esDuenio: true,
      });

      const mascotaGuardada = new Mascota({
        id: 'mascota-abc',
        nombre: dtoBase.nombre,
        especie: dtoBase.especie,
        raza: dtoBase.raza,
        fechaNacimiento: dtoBase.fechaNacimiento,
        duenioId: dtoBase.duenioId,
      });

      mascotaRepository.save.mockResolvedValue(mascotaGuardada);

      const resultado = await useCase.ejecutar(dtoBase);

      expect(duenioValidator.verificar).toHaveBeenCalledWith(dtoBase.duenioId);
      expect(mascotaRepository.save).toHaveBeenCalledTimes(1);
      expect(mascotaRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: dtoBase.nombre,
          especie: dtoBase.especie,
          raza: dtoBase.raza,
          duenioId: dtoBase.duenioId,
        }),
      );
      expect(resultado).toEqual(mascotaGuardada);
    });
  });

  describe('caso 2: rechazar si el dueño no existe', () => {
    it('debe lanzar OperacionNoAutorizadaException y no debe guardar la mascota', async () => {
      duenioValidator.verificar.mockResolvedValue({
        existe: false,
        esDuenio: false,
      });

      await expect(useCase.ejecutar(dtoBase)).rejects.toThrow(
        OperacionNoAutorizadaException,
      );

      expect(mascotaRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('caso 3: rechazar si el dueño existe pero su rol no es OWNER', () => {
    it('debe lanzar OperacionNoAutorizadaException (mismo error que si no existiera, para no filtrar roles) y no debe guardar la mascota', async () => {
      duenioValidator.verificar.mockResolvedValue({
        existe: true,
        esDuenio: false,
      });

      await expect(useCase.ejecutar(dtoBase)).rejects.toThrow(
        OperacionNoAutorizadaException,
      );

      expect(mascotaRepository.save).not.toHaveBeenCalled();
    });
  });
});
