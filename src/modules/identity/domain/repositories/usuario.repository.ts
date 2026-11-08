import { Usuario } from '../entities/usuario.entity';

export interface UsuarioRepository {
  findById(id: string): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
  /**
   * Busca varios usuarios por id en una sola consulta. Pensado para
   * procesos batch que ya tienen una lista de ids y necesitan resolverlos
   * sin una consulta por id (N+1).
   */
  findByIds(ids: string[]): Promise<Usuario[]>;
  save(usuario: Usuario): Promise<Usuario>;
}

export const USUARIO_REPOSITORY = Symbol('USUARIO_REPOSITORY');
