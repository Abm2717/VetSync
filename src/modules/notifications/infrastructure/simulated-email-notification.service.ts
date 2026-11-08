import { Injectable, Logger } from '@nestjs/common';
import {
  EmailNotificationPayload,
  EmailNotificationService,
} from '../domain/services/email-notification.service';

/**
 * Implementación simulada: el requerimiento pide notificaciones "simuladas"
 * por correo, así que en vez de integrar un proveedor real (SendGrid, SES,
 * etc.) solo se registra el envío en el log de la aplicación.
 */
@Injectable()
export class SimulatedEmailNotificationService
  implements EmailNotificationService
{
  private readonly logger = new Logger(SimulatedEmailNotificationService.name);

  async enviar(payload: EmailNotificationPayload): Promise<void> {
    this.logger.log(
      `[EMAIL SIMULADO] Para: ${payload.to} | Asunto: ${payload.subject}\n${payload.body}`,
    );
  }
}
