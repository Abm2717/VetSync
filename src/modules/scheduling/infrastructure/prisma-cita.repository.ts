import { Injectable } from '@nestjs/common';
import {
  Cita as PrismaCita,
  EstadoCita as PrismaEstadoCita,
} from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { Cita, EstadoCita } from '../domain/entities/cita.entity';
import { CitaRepository } from '../domain/repositories/cita.repository';

@Injectable()
export class PrismaCitaRepository implements CitaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Cita | null> {
    const cita = await this.prisma.cita.findUnique({ where: { id } });
    return cita ? this.toDomain(cita) : null;
  }

  async findByVeterinarioYHorario(
    veterinarioId: string,
    fecha: Date,
  ): Promise<Cita | null> {
    const cita = await this.prisma.cita.findFirst({
      where: {
        veterinarioId,
        fechaHora: fecha,
        estado: { not: PrismaEstadoCita.CANCELADA },
      },
    });

    return cita ? this.toDomain(cita) : null;
  }

  async existeConflictoHorario(
    veterinarioId: string,
    fecha: Date,
    excluirCitaId?: string,
  ): Promise<boolean> {
    const conflicto = await this.prisma.cita.findFirst({
      where: {
        veterinarioId,
        fechaHora: fecha,
        estado: { not: PrismaEstadoCita.CANCELADA },
        ...(excluirCitaId ? { id: { not: excluirCitaId } } : {}),
      },
    });

    return conflicto !== null;
  }

  async findProximasEnVentana(desde: Date, hasta: Date): Promise<Cita[]> {
    const citas = await this.prisma.cita.findMany({
      where: {
        fechaHora: { gte: desde, lte: hasta },
        estado: { not: PrismaEstadoCita.CANCELADA },
      },
    });

    return citas.map((cita) => this.toDomain(cita));
  }

  async save(cita: Cita): Promise<void> {
    await this.prisma.cita.upsert({
      where: { id: cita.id },
      create: {
        id: cita.id,
        mascotaId: cita.mascotaId,
        veterinarioId: cita.veterinarioId,
        fechaHora: cita.fecha,
        estado: this.toPersistenceEstado(cita.estado),
      },
      update: {
        fechaHora: cita.fecha,
        estado: this.toPersistenceEstado(cita.estado),
      },
    });
  }

  private toDomain(cita: PrismaCita): Cita {
    return new Cita({
      id: cita.id,
      mascotaId: cita.mascotaId,
      veterinarioId: cita.veterinarioId,
      fecha: cita.fechaHora,
      estado: this.toDomainEstado(cita.estado),
    });
  }

  private toDomainEstado(estado: PrismaEstadoCita): EstadoCita {
    switch (estado) {
      case PrismaEstadoCita.CANCELADA:
        return EstadoCita.CANCELADA;
      case PrismaEstadoCita.COMPLETADA:
        return EstadoCita.COMPLETADA;
      default:
        return EstadoCita.PROGRAMADA;
    }
  }

  private toPersistenceEstado(estado: EstadoCita): PrismaEstadoCita {
    switch (estado) {
      case EstadoCita.CANCELADA:
        return PrismaEstadoCita.CANCELADA;
      case EstadoCita.COMPLETADA:
        return PrismaEstadoCita.COMPLETADA;
      default:
        return PrismaEstadoCita.PROGRAMADA;
    }
  }
}
