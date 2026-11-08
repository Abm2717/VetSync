import { Controller, Param, Post } from '@nestjs/common';
import { EnviarNotificacionCitaUseCase } from '../application/use-cases/enviar-notificacion-cita.use-case';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly enviarNotificacionCitaUseCase: EnviarNotificacionCitaUseCase,
  ) {}

  @Post('citas/:citaId/recordatorio')
  async enviarRecordatorio(@Param('citaId') citaId: string) {
    await this.enviarNotificacionCitaUseCase.ejecutar(citaId);
    return { citaId, enviado: true };
  }
}
