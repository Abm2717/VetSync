import { Inject, Injectable } from '@nestjs/common';
import {
  UsuarioRepository,
  USUARIO_REPOSITORY,
} from '../../domain/repositories/usuario.repository';
import {
  PasswordHasher,
  PASSWORD_HASHER,
} from '../../domain/services/password-hasher';
import {
  TokenGenerator,
  TOKEN_GENERATOR,
} from '../../domain/services/token-generator';
import { CredencialesInvalidasException } from '../../domain/exceptions';

export interface AutenticarUsuarioInput {
  email: string;
  password: string;
}

export interface AutenticarUsuarioOutput {
  token: string;
}

@Injectable()
export class AutenticarUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_GENERATOR)
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async ejecutar(
    input: AutenticarUsuarioInput,
  ): Promise<AutenticarUsuarioOutput> {
    const usuario = await this.usuarioRepository.findByEmail(input.email);

    if (!usuario) {
      throw new CredencialesInvalidasException();
    }

    // Una cuenta sin password almacenado nunca puede autenticarse por este
    // medio. Se rechaza antes de llamar a comparar(): depender de que el
    // hasher maneje un hash vacío/null de forma segura es una suposición
    // frágil (puede lanzar una excepción no controlada, o responder en un
    // tiempo distinto al de una comparación real, lo que es una fuga de
    // información sutil).
    if (!usuario.password) {
      throw new CredencialesInvalidasException();
    }

    const passwordValido = await this.passwordHasher.comparar(
      input.password,
      usuario.password,
    );

    if (!passwordValido) {
      throw new CredencialesInvalidasException();
    }

    return { token: this.tokenGenerator.generar(usuario.id) };
  }
}
