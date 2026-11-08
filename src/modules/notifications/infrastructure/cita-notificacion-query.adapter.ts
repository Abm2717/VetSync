import { Inject, Injectable } from '@nestjs/common';
import {
  CitaRepository,
  CITA_REPOSITORY,
} from '../../scheduling/domain/repositories/cita.repository';
import { EstadoCita } from '../../scheduling/domain/entities/cita.entity';
import {
  MascotaRepository,
  MASCOTA_REPOSITORY,
} from '../../patients/domain/repositories/mascota.repository';
import {
  UsuarioRepository,
  USUARIO_REPOSITORY,
} from '../../identity/domain/repositories/usuario.repository';
import {
  CitaNotificacionQuery,
  DatosNotificacion,
} from '../domain/services/cita-notificacion-query';

const VENTANA_NOTIFICACION_HORAS = 24;

@Injectable()
export class CitaNotificacionQueryAdapter implements CitaNotificacionQuery {
  constructor(
    @Inject(CITA_REPOSITORY)
    private readonly citaRepository: CitaRepository,
    @Inject(MASCOTA_REPOSITORY)
    private readonly mascotaRepository: MascotaRepository,
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async obtenerDatosParaNotificar(
    citaId: string,
  ): Promise<DatosNotificacion | null> {
    const cita = await this.citaRepository.findById(citaId);
    if (!cita) {
      return null;
    }

    if (cita.estado === EstadoCita.CANCELADA) {
      return null;
    }

    if (!this.estaDentroDeLaVentana(cita.fecha)) {
      return null;
    }

    const mascota = await this.mascotaRepository.findById(cita.mascotaId);
    if (!mascota) {
      return null;
    }

    const duenio = await this.usuarioRepository.findById(mascota.duenioId);
    if (!duenio?.email) {
      return null;
    }

    return {
      citaId: cita.id,
      fecha: cita.fecha,
      emailDuenio: duenio.email,
    };
  }

  async obtenerDatosParaNotificarLote(
    ventanaHoras: number,
  ): Promise<DatosNotificacion[]> {
    const ahora = new Date();
    const limite = new Date(ahora.getTime() + ventanaHoras * 60 * 60 * 1000);

    // 1 consulta para todas las citas próximas, en vez de 1 por cita.
    const citas = await this.citaRepository.findProximasEnVentana(
      ahora,
      limite,
    );
    if (citas.length === 0) {
      return [];
    }

    // 1 consulta para todas las mascotas involucradas (sin duplicados).
    const mascotaIds = [...new Set(citas.map((cita) => cita.mascotaId))];
    const mascotas = await this.mascotaRepository.findByIds(mascotaIds);
    const mascotaPorId = new Map(mascotas.map((m) => [m.id, m]));

    // 1 consulta para todos los dueños involucrados (sin duplicados).
    const duenioIds = [
      ...new Set(mascotas.map((mascota) => mascota.duenioId)),
    ];
    const duenios = await this.usuarioRepository.findByIds(duenioIds);
    const duenioPorId = new Map(duenios.map((u) => [u.id, u]));

    const resultados: DatosNotificacion[] = [];
    for (const cita of citas) {
      const mascota = mascotaPorId.get(cita.mascotaId);
      if (!mascota) {
        continue;
      }

      const duenio = duenioPorId.get(mascota.duenioId);
      if (!duenio?.email) {
        continue;
      }

      resultados.push({
        citaId: cita.id,
        fecha: cita.fecha,
        emailDuenio: duenio.email,
      });
    }

    return resultados;
  }

  private estaDentroDeLaVentana(fechaCita: Date): boolean {
    const horasRestantes =
      (fechaCita.getTime() - Date.now()) / (1000 * 60 * 60);

    return horasRestantes >= 0 && horasRestantes <= VENTANA_NOTIFICACION_HORAS;
  }
}
