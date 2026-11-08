import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  UsuarioRepository,
  USUARIO_REPOSITORY,
} from '../../domain/repositories/usuario.repository';
import {
  PasswordHasher,
  PASSWORD_HASHER,
} from '../../domain/services/password-hasher';
import { Usuario } from '../../domain/entities/usuario.entity';
import { RolUsuario } from '../../domain/value-objects/rol-usuario.enum';
import { RegistrarUsuarioDto } from './dto/registrar-usuario.dto';
import {
  EmailYaRegistradoException,
  RolInvalidoException,
} from '../../domain/exceptions';

/**
 * Caso de uso: registrar un nuevo usuario (Dueño o Veterinario).
 */
@Injectable()
export class RegistrarUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async ejecutar(dto: RegistrarUsuarioDto): Promise<Usuario> {
    const usuarioExistente = await this.usuarioRepository.findByEmail(
      dto.email,
    );
    if (usuarioExistente) {
      throw new EmailYaRegistradoException(dto.email);
    }

    if (!Object.values(RolUsuario).includes(dto.rol)) {
      throw new RolInvalidoException(dto.rol);
    }

    const passwordHasheado = await this.passwordHasher.hashear(dto.password);

    const nuevoUsuario = new Usuario({
      id: randomUUID(),
      email: dto.email,
      nombre: dto.nombre,
      rol: dto.rol,
      password: passwordHasheado,
    });

    return this.usuarioRepository.save(nuevoUsuario);
  }
}
