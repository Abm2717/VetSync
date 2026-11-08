import { Injectable } from '@nestjs/common';
import { Mascota as PrismaMascota } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { Mascota } from '../domain/entities/mascota.entity';
import { MascotaRepository } from '../domain/repositories/mascota.repository';

@Injectable()
export class PrismaMascotaRepository implements MascotaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Mascota | null> {
    const mascota = await this.prisma.mascota.findUnique({ where: { id } });
    return mascota ? this.toDomain(mascota) : null;
  }

  async findByIds(ids: string[]): Promise<Mascota[]> {
    if (ids.length === 0) {
      return [];
    }

    const mascotas = await this.prisma.mascota.findMany({
      where: { id: { in: ids } },
    });

    return mascotas.map((mascota) => this.toDomain(mascota));
  }

  async save(mascota: Mascota): Promise<Mascota> {
    const guardada = await this.prisma.mascota.upsert({
      where: { id: mascota.id },
      create: {
        id: mascota.id,
        nombre: mascota.nombre,
        especie: mascota.especie,
        raza: mascota.raza,
        fechaNacimiento: mascota.fechaNacimiento,
        duenioId: mascota.duenioId,
      },
      update: {
        nombre: mascota.nombre,
        especie: mascota.especie,
        raza: mascota.raza,
        fechaNacimiento: mascota.fechaNacimiento,
        duenioId: mascota.duenioId,
      },
    });

    return this.toDomain(guardada);
  }

  private toDomain(mascota: PrismaMascota): Mascota {
    return new Mascota({
      id: mascota.id,
      nombre: mascota.nombre,
      especie: mascota.especie,
      raza: mascota.raza,
      fechaNacimiento: mascota.fechaNacimiento,
      duenioId: mascota.duenioId,
    });
  }
}
