import { Inject, Injectable } from '@nestjs/common';
import {
  MascotaRepository,
  MASCOTA_REPOSITORY,
} from '../../patients/domain/repositories/mascota.repository';
import { MascotaValidator } from '../domain/services/mascota-validator';

@Injectable()
export class MascotaValidatorAdapter implements MascotaValidator {
  constructor(
    @Inject(MASCOTA_REPOSITORY)
    private readonly mascotaRepository: MascotaRepository,
  ) {}

  async existe(mascotaId: string): Promise<boolean> {
    const mascota = await this.mascotaRepository.findById(mascotaId);
    return !!mascota;
  }
}
