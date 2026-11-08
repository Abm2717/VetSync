import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { AgendarCitaUseCase } from '../application/use-cases/agendar-cita.use-case';
import { CancelarCitaUseCase } from '../application/use-cases/cancelar-cita.use-case';
import { ReagendarCitaUseCase } from '../application/use-cases/reagendar-cita.use-case';
import { AgendarCitaDto } from '../application/use-cases/dto/agendar-cita.dto';

@Controller('scheduling')
export class SchedulingController {
  constructor(
    private readonly agendarCitaUseCase: AgendarCitaUseCase,
    private readonly cancelarCitaUseCase: CancelarCitaUseCase,
    private readonly reagendarCitaUseCase: ReagendarCitaUseCase,
  ) {}

  @Post('citas')
  async agendar(@Body() dto: AgendarCitaDto) {
    return this.agendarCitaUseCase.ejecutar(dto);
  }

  @Patch('citas/:citaId/cancelar')
  async cancelar(@Param('citaId') citaId: string) {
    await this.cancelarCitaUseCase.ejecutar({ citaId });
    return { citaId, cancelada: true };
  }

  @Patch('citas/:citaId/reagendar')
  async reagendar(
    @Param('citaId') citaId: string,
    @Body() body: { nuevaFecha: string },
  ) {
    return this.reagendarCitaUseCase.ejecutar({
      citaId,
      nuevaFecha: new Date(body.nuevaFecha),
    });
  }
}
