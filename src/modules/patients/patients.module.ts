import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { MASCOTA_REPOSITORY } from './domain/repositories/mascota.repository';
import { REGISTRO_MEDICO_REPOSITORY } from './domain/repositories/registro-medico.repository';
import { DUENIO_VALIDATOR } from './domain/services/duenio-validator';
import { VETERINARIO_VALIDATOR } from './domain/services/veterinario-validator';
import { PrismaMascotaRepository } from './infrastructure/prisma-mascota.repository';
import { PrismaRegistroMedicoRepository } from './infrastructure/prisma-registro-medico.repository';
import { DuenioValidatorAdapter } from './infrastructure/duenio-validator.adapter';
import { VeterinarioValidatorAdapter } from './infrastructure/veterinario-validator.adapter';
import { RegistrarMascotaUseCase } from './application/use-cases/registrar-mascota.use-case';
import { RegistrarConsultaMedicaUseCase } from './application/use-cases/registrar-consulta-medica.use-case';
import { ConsultarHistorialMedicoUseCase } from './application/use-cases/consultar-historial-medico.use-case';
import { PatientsController } from './presentation/patients.controller';

@Module({
  imports: [IdentityModule],
  controllers: [PatientsController],
  providers: [
    { provide: MASCOTA_REPOSITORY, useClass: PrismaMascotaRepository },
    {
      provide: REGISTRO_MEDICO_REPOSITORY,
      useClass: PrismaRegistroMedicoRepository,
    },
    { provide: DUENIO_VALIDATOR, useClass: DuenioValidatorAdapter },
    { provide: VETERINARIO_VALIDATOR, useClass: VeterinarioValidatorAdapter },
    RegistrarMascotaUseCase,
    RegistrarConsultaMedicaUseCase,
    ConsultarHistorialMedicoUseCase,
  ],
  exports: [MASCOTA_REPOSITORY],
})
export class PatientsModule {}
