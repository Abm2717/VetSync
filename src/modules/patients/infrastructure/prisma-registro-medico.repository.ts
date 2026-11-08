import { Injectable } from '@nestjs/common';
import { RegistroMedico as PrismaRegistroMedico } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { RegistroMedico } from '../domain/entities/registro-medico.entity';
import { RegistroMedicoRepository } from '../domain/repositories/registro-medico.repository';

@Injectable()
export class PrismaRegistroMedicoRepository
  implements RegistroMedicoRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async save(registro: RegistroMedico): Promise<RegistroMedico> {
    const guardado = await this.prisma.registroMedico.upsert({
      where: { id: registro.id },
      create: {
        id: registro.id,
        mascotaId: registro.mascotaId,
        veterinarioId: registro.veterinarioId,
        diagnostico: registro.diagnostico,
        tratamiento: registro.tratamiento,
        notas: registro.notas,
        fecha: registro.fecha,
      },
      update: {
        diagnostico: registro.diagnostico,
        tratamiento: registro.tratamiento,
        notas: registro.notas,
      },
    });

    return this.toDomain(guardado);
  }

  async findByMascotaId(mascotaId: string): Promise<RegistroMedico[]> {
    const registros = await this.prisma.registroMedico.findMany({
      where: { mascotaId },
      orderBy: { fecha: 'desc' },
    });

    return registros.map((registro) => this.toDomain(registro));
  }

  private toDomain(registro: PrismaRegistroMedico): RegistroMedico {
    return new RegistroMedico({
      id: registro.id,
      mascotaId: registro.mascotaId,
      veterinarioId: registro.veterinarioId,
      diagnostico: registro.diagnostico,
      tratamiento: registro.tratamiento ?? undefined,
      notas: registro.notas ?? undefined,
      fecha: registro.fecha,
    });
  }
}
