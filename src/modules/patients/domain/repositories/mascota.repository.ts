import { Mascota } from '../entities/mascota.entity';

export interface MascotaRepository {
  findById(id: string): Promise<Mascota | null>;
  /**
   * Busca varias mascotas por id en una sola consulta. Pensado para
   * procesos batch que ya tienen una lista de ids (p. ej. a partir de un
   * lote de citas) y necesitan resolverlos sin una consulta por id (N+1).
   */
  findByIds(ids: string[]): Promise<Mascota[]>;
  save(mascota: Mascota): Promise<Mascota>;
}

export const MASCOTA_REPOSITORY = Symbol('MASCOTA_REPOSITORY');
