import { Inject, Injectable } from '@nestjs/common';
import {
  CitaNotificacionQuery,
  CITA_NOTIFICACION_QUERY,
} from '../../domain/services/cita-notificacion-query';
import {
  EmailNotificationService,
  EMAIL_NOTIFICATION_SERVICE,
} from '../../domain/services/email-notification.service';

@Injectable()
export class EnviarNotificacionCitaUseCase {
  constructor(
    @Inject(CITA_NOTIFICACION_QUERY)
    private readonly citaQuery: CitaNotificacionQuery,
    @Inject(EMAIL_NOTIFICATION_SERVICE)
    private readonly emailService: EmailNotificationService,
  ) {}

  async ejecutar(citaId: string): Promise<void> {
    const datos = await this.citaQuery.obtenerDatosParaNotificar(citaId);
    if (!datos) {
      return;
    }

    await this.emailService.enviar({
      to: datos.emailDuenio,
      subject: 'Recordatorio de tu cita veterinaria',
      body: `Tu cita (ID: ${datos.citaId}) está programada para ${datos.fecha.toISOString()}.`,
    });
  }
}
