import { RegistroMedico } from '../entities/registro-medico.entity';

export interface RegistroMedicoRepository {
  save(registro: RegistroMedico): Promise<RegistroMedico>;
  findByMascotaId(mascotaId: string): Promise<RegistroMedico[]>;
}

export const REGISTRO_MEDICO_REPOSITORY = Symbol('REGISTRO_MEDICO_REPOSITORY');
