import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { PatientsModule } from '../patients/patients.module';
import { SchedulingModule } from '../scheduling/scheduling.module';
import { EMAIL_NOTIFICATION_SERVICE } from './domain/services/email-notification.service';
import { CITA_NOTIFICACION_QUERY } from './domain/services/cita-notificacion-query';
import { SimulatedEmailNotificationService } from './infrastructure/simulated-email-notification.service';
import { CitaNotificacionQueryAdapter } from './infrastructure/cita-notificacion-query.adapter';
import { EnviarNotificacionCitaUseCase } from './application/use-cases/enviar-notificacion-cita.use-case';
import { NotificationsController } from './presentation/notifications.controller';

@Module({
  imports: [SchedulingModule, PatientsModule, IdentityModule],
  controllers: [NotificationsController],
  providers: [
    {
      provide: EMAIL_NOTIFICATION_SERVICE,
      useClass: SimulatedEmailNotificationService,
    },
    {
      provide: CITA_NOTIFICACION_QUERY,
      useClass: CitaNotificacionQueryAdapter,
    },
    EnviarNotificacionCitaUseCase,
  ],
})
export class NotificationsModule {}
