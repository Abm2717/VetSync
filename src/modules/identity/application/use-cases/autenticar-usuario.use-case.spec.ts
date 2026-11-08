import { AutenticarUsuarioUseCase } from './autenticar-usuario.use-case';
import { UsuarioRepository } from '../../domain/repositories/usuario.repository';
import { PasswordHasher } from '../../domain/services/password-hasher';
import { TokenGenerator } from '../../domain/services/token-generator';
import { Usuario } from '../../domain/entities/usuario.entity';
import { RolUsuario } from '../../domain/value-objects/rol-usuario.enum';
import { CredencialesInvalidasException } from '../../domain/exceptions';

describe('AutenticarUsuarioUseCase', () => {
  let useCase: AutenticarUsuarioUseCase;
  let usuarioRepository: jest.Mocked<UsuarioRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let tokenGenerator: jest.Mocked<TokenGenerator>;

  const usuarioValido = new Usuario({
    id: 'usr-001',
    nombre: 'Dueño de Prueba',
    email: 'dueno@vetsync.com',
    password: 'hash_almacenado_123',
    rol: RolUsuario.OWNER,
  });

  beforeEach(() => {
    usuarioRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<UsuarioRepository>;

    passwordHasher = {
      comparar: jest.fn(),
    } as unknown as jest.Mocked<PasswordHasher>;

    tokenGenerator = {
      generar: jest.fn(),
    };

    useCase = new AutenticarUsuarioUseCase(
      usuarioRepository,
      passwordHasher,
      tokenGenerator,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe autenticar con credenciales correctas y retornar un token', async () => {
    usuarioRepository.findByEmail.mockResolvedValue(usuarioValido);
    passwordHasher.comparar.mockResolvedValue(true);
    tokenGenerator.generar.mockReturnValue('token-generado-123');

    const resultado = await useCase.ejecutar({
      email: 'dueno@vetsync.com',
      password: 'password_correcto',
    });

    expect(usuarioRepository.findByEmail).toHaveBeenCalledWith(
      'dueno@vetsync.com',
    );
    expect(passwordHasher.comparar).toHaveBeenCalledWith(
      'password_correcto',
      usuarioValido.password,
    );
    expect(tokenGenerator.generar).toHaveBeenCalledWith(usuarioValido.id);
    expect(resultado).toEqual({ token: 'token-generado-123' });
  });

  it('debe rechazar si el email no existe', async () => {
    usuarioRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.ejecutar({
        email: 'no-existe@vetsync.com',
        password: 'cualquier_password',
      }),
    ).rejects.toThrow(CredencialesInvalidasException);

    expect(passwordHasher.comparar).not.toHaveBeenCalled();
    expect(tokenGenerator.generar).not.toHaveBeenCalled();
  });

  it('debe rechazar si la contraseña no coincide', async () => {
    usuarioRepository.findByEmail.mockResolvedValue(usuarioValido);
    passwordHasher.comparar.mockResolvedValue(false);

    await expect(
      useCase.ejecutar({
        email: 'dueno@vetsync.com',
        password: 'password_incorrecto',
      }),
    ).rejects.toThrow(CredencialesInvalidasException);

    expect(passwordHasher.comparar).toHaveBeenCalledWith(
      'password_incorrecto',
      usuarioValido.password,
    );
    expect(tokenGenerator.generar).not.toHaveBeenCalled();
  });

  it('debe rechazar sin llamar al hasher si la cuenta no tiene password almacenado', async () => {
    const usuarioSinPassword = new Usuario({
      id: 'usr-002',
      nombre: 'Cuenta sin password',
      email: 'sinpassword@vetsync.com',
      rol: RolUsuario.OWNER,
    });
    usuarioRepository.findByEmail.mockResolvedValue(usuarioSinPassword);

    await expect(
      useCase.ejecutar({
        email: 'sinpassword@vetsync.com',
        password: 'cualquier_password',
      }),
    ).rejects.toThrow(CredencialesInvalidasException);

    expect(passwordHasher.comparar).not.toHaveBeenCalled();
    expect(tokenGenerator.generar).not.toHaveBeenCalled();
  });
});
