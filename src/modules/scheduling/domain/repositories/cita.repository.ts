import { Cita } from '../entities/cita.entity';

/**
 * Puerto (interfaz) del repositorio de citas. La implementación concreta
 * (p. ej. con Prisma/PostgreSQL) vive en la capa de infraestructura.
 */
export interface CitaRepository {
  findById(id: string): Promise<Cita | null>;
  findByVeterinarioYHorario(
    veterinarioId: string,
    fecha: Date,
  ): Promise<Cita | null>;
  /**
   * Igual que findByVeterinarioYHorario, pero excluye una cita por id del
   * chequeo — se usa al reagendar, para que la cita no choque consigo misma.
   */
  existeConflictoHorario(
    veterinarioId: string,
    fecha: Date,
    excluirCitaId?: string,
  ): Promise<boolean>;
  /**
   * Todas las citas no canceladas cuya fecha cae en [desde, hasta].
   * Pensado para procesos batch (p. ej. un cron de notificaciones) que
   * necesitan revisar muchas citas próximas en una sola consulta, en vez
   * de una consulta por cita (N+1).
   */
  findProximasEnVentana(desde: Date, hasta: Date): Promise<Cita[]>;
  save(cita: Cita): Promise<void>;
}

export const CITA_REPOSITORY = Symbol('CITA_REPOSITORY');
