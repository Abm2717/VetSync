import { Injectable } from '@nestjs/common';
import { Rol as PrismaRol, Usuario as PrismaUsuario } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { Usuario } from '../domain/entities/usuario.entity';
import { UsuarioRepository } from '../domain/repositories/usuario.repository';
import { RolUsuario } from '../domain/value-objects/rol-usuario.enum';

@Injectable()
export class PrismaUsuarioRepository implements UsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Usuario | null> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    return usuario ? this.toDomain(usuario) : null;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
    });
    return usuario ? this.toDomain(usuario) : null;
  }

  async findByIds(ids: string[]): Promise<Usuario[]> {
    if (ids.length === 0) {
      return [];
    }

    const usuarios = await this.prisma.usuario.findMany({
      where: { id: { in: ids } },
    });

    return usuarios.map((usuario) => this.toDomain(usuario));
  }

  async save(usuario: Usuario): Promise<Usuario> {
    const guardado = await this.prisma.usuario.upsert({
      where: { id: usuario.id },
      create: {
        id: usuario.id,
        email: usuario.email ?? '',
        nombre: usuario.nombre,
        rol: this.toPersistenceRol(usuario.rol),
        password: usuario.password,
      },
      update: {
        email: usuario.email ?? '',
        nombre: usuario.nombre,
        rol: this.toPersistenceRol(usuario.rol),
        password: usuario.password,
      },
    });

    return this.toDomain(guardado);
  }

  private toDomain(usuario: PrismaUsuario): Usuario {
    return new Usuario({
      id: usuario.id,
      nombre: usuario.nombre,
      rol: this.toDomainRol(usuario.rol),
      email: usuario.email,
      password: usuario.password ?? undefined,
    });
  }

  private toDomainRol(rol: PrismaRol): RolUsuario {
    return rol === PrismaRol.VETERINARIO
      ? RolUsuario.VETERINARIO
      : RolUsuario.OWNER;
  }

  private toPersistenceRol(rol: RolUsuario): PrismaRol {
    return rol === RolUsuario.VETERINARIO
      ? PrismaRol.VETERINARIO
      : PrismaRol.OWNER;
  }
}
