import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  MascotaRepository,
  MASCOTA_REPOSITORY,
} from '../../domain/repositories/mascota.repository';
import {
  DuenioValidator,
  DUENIO_VALIDATOR,
} from '../../domain/services/duenio-validator';
import { Mascota } from '../../domain/entities/mascota.entity';
import { RegistrarMascotaDto } from './dto/registrar-mascota.dto';
import { OperacionNoAutorizadaException } from '../../domain/exceptions';

@Injectable()
export class RegistrarMascotaUseCase {
  private readonly logger = new Logger(RegistrarMascotaUseCase.name);

  constructor(
    @Inject(MASCOTA_REPOSITORY)
    private readonly mascotaRepository: MascotaRepository,
    @Inject(DUENIO_VALIDATOR)
    private readonly duenioValidator: DuenioValidator,
  ) {}

  async ejecutar(dto: RegistrarMascotaDto): Promise<Mascota> {
    // Se responde con un único error genérico tanto si el duenioId no
    // existe como si existe pero no tiene rol OWNER: distinguir ambos
    // casos de cara al cliente permitiría enumerar ids de usuario válidos
    // y su rol. La causa específica se deja en el log del servidor.
    const validacion = await this.duenioValidator.verificar(dto.duenioId);

    if (!validacion.existe) {
      this.logger.warn(
        `Intento de registrar mascota con duenioId inexistente: ${dto.duenioId}`,
      );
      throw new OperacionNoAutorizadaException();
    }

    if (!validacion.esDuenio) {
      this.logger.warn(
        `Usuario ${dto.duenioId} intentó registrar una mascota sin tener rol OWNER`,
      );
      throw new OperacionNoAutorizadaException();
    }

    const nuevaMascota = new Mascota({
      id: randomUUID(),
      nombre: dto.nombre,
      especie: dto.especie,
      raza: dto.raza,
      fechaNacimiento: dto.fechaNacimiento,
      duenioId: dto.duenioId,
    });

    return this.mascotaRepository.save(nuevaMascota);
  }
}
