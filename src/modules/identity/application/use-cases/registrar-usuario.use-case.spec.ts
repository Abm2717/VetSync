import { Test, TestingModule } from '@nestjs/testing';
import { RegistrarUsuarioUseCase } from './registrar-usuario.use-case';
import {
  UsuarioRepository,
  USUARIO_REPOSITORY,
} from '../../domain/repositories/usuario.repository';
import {
  PasswordHasher,
  PASSWORD_HASHER,
} from '../../domain/services/password-hasher';
import { RolUsuario } from '../../domain/value-objects/rol-usuario.enum';
import {
  EmailYaRegistradoException,
  RolInvalidoException,
} from '../../domain/exceptions';

describe('RegistrarUsuarioUseCase', () => {
  let useCase: RegistrarUsuarioUseCase;
  let usuarioRepository: jest.Mocked<UsuarioRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;

  beforeEach(async () => {
    const usuarioRepositoryMock: jest.Mocked<UsuarioRepository> = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<UsuarioRepository>;

    const passwordHasherMock: jest.Mocked<PasswordHasher> = {
      hashear: jest.fn(),
      comparar: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrarUsuarioUseCase,
        {
          provide: USUARIO_REPOSITORY,
          useValue: usuarioRepositoryMock,
        },
        {
          provide: PASSWORD_HASHER,
          useValue: passwordHasherMock,
        },
      ],
    }).compile();

    useCase = module.get<RegistrarUsuarioUseCase>(RegistrarUsuarioUseCase);
    usuarioRepository = module.get(USUARIO_REPOSITORY);
    passwordHasher = module.get(PASSWORD_HASHER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Caso 1: registrar usuario con email único (éxito)', () => {
    it('debe registrar al usuario con la contraseña hasheada cuando el email no existe previamente', async () => {
      const dto = {
        email: 'nuevo.usuario@example.com',
        password: 'ClaveSegura123',
        nombre: 'Juan Pérez',
        rol: RolUsuario.OWNER,
      };

      usuarioRepository.findByEmail.mockResolvedValue(null);
      passwordHasher.hashear.mockResolvedValue('hash_simulado_123');
      usuarioRepository.save.mockResolvedValue({
        id: 'uuid-generado',
        email: dto.email,
        nombre: dto.nombre,
        rol: dto.rol,
      } as any);

      const resultado = await useCase.ejecutar(dto);

      expect(usuarioRepository.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(passwordHasher.hashear).toHaveBeenCalledWith(dto.password);
      expect(usuarioRepository.save).toHaveBeenCalledTimes(1);
      expect(usuarioRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: dto.email,
          nombre: dto.nombre,
          rol: dto.rol,
          password: 'hash_simulado_123',
        }),
      );
      expect(resultado).toEqual(
        expect.objectContaining({
          email: dto.email,
          nombre: dto.nombre,
          rol: dto.rol,
        }),
      );
    });
  });

  describe('Caso 2: rechazar si el email ya está registrado', () => {
    it('debe lanzar EmailYaRegistradoException si el repositorio ya tiene ese email', async () => {
      const dto = {
        email: 'existente@example.com',
        password: 'ClaveSegura123',
        nombre: 'Ana López',
        rol: RolUsuario.VETERINARIO,
      };

      usuarioRepository.findByEmail.mockResolvedValue({
        id: 'uuid-existente',
        email: dto.email,
        nombre: 'Ana López',
        rol: RolUsuario.VETERINARIO,
      } as any);

      await expect(useCase.ejecutar(dto)).rejects.toThrow(
        EmailYaRegistradoException,
      );
      expect(passwordHasher.hashear).not.toHaveBeenCalled();
      expect(usuarioRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('Caso 3: rechazar si el rol enviado no es válido', () => {
    it('debe lanzar RolInvalidoException si el rol no es OWNER ni VETERINARIO', async () => {
      const dto = {
        email: 'rol.invalido@example.com',
        password: 'ClaveSegura123',
        nombre: 'Carlos Ruiz',
        rol: 'ADMIN' as RolUsuario,
      };

      usuarioRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.ejecutar(dto)).rejects.toThrow(RolInvalidoException);
      expect(passwordHasher.hashear).not.toHaveBeenCalled();
      expect(usuarioRepository.save).not.toHaveBeenCalled();
    });
  });
});
