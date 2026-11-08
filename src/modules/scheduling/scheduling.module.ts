import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { PatientsModule } from '../patients/patients.module';
import { CITA_REPOSITORY } from './domain/repositories/cita.repository';
import { MASCOTA_VALIDATOR } from './domain/services/mascota-validator';
import { VETERINARIO_VALIDATOR } from './domain/services/veterinario-validator';
import { PrismaCitaRepository } from './infrastructure/prisma-cita.repository';
import { MascotaValidatorAdapter } from './infrastructure/mascota-validator.adapter';
import { VeterinarioValidatorAdapter } from './infrastructure/veterinario-validator.adapter';
import { AgendarCitaUseCase } from './application/use-cases/agendar-cita.use-case';
import { CancelarCitaUseCase } from './application/use-cases/cancelar-cita.use-case';
import { ReagendarCitaUseCase } from './application/use-cases/reagendar-cita.use-case';
import { SchedulingController } from './presentation/scheduling.controller';

@Module({
  imports: [PatientsModule, IdentityModule],
  controllers: [SchedulingController],
  providers: [
    { provide: CITA_REPOSITORY, useClass: PrismaCitaRepository },
    { provide: MASCOTA_VALIDATOR, useClass: MascotaValidatorAdapter },
    { provide: VETERINARIO_VALIDATOR, useClass: VeterinarioValidatorAdapter },
    AgendarCitaUseCase,
    CancelarCitaUseCase,
    ReagendarCitaUseCase,
  ],
  exports: [CITA_REPOSITORY],
})
export class SchedulingModule {}
