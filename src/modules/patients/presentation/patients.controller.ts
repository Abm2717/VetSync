import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RegistrarMascotaUseCase } from '../application/use-cases/registrar-mascota.use-case';
import { RegistrarConsultaMedicaUseCase } from '../application/use-cases/registrar-consulta-medica.use-case';
import { ConsultarHistorialMedicoUseCase } from '../application/use-cases/consultar-historial-medico.use-case';
import { RegistrarMascotaDto } from '../application/use-cases/dto/registrar-mascota.dto';
import { RegistrarConsultaMedicaDto } from '../application/use-cases/dto/registrar-consulta-medica.dto';

@Controller('patients')
export class PatientsController {
  constructor(
    private readonly registrarMascotaUseCase: RegistrarMascotaUseCase,
    private readonly registrarConsultaMedicaUseCase: RegistrarConsultaMedicaUseCase,
    private readonly consultarHistorialMedicoUseCase: ConsultarHistorialMedicoUseCase,
  ) {}

  @Post('mascotas')
  async registrarMascota(@Body() dto: RegistrarMascotaDto) {
    return this.registrarMascotaUseCase.ejecutar(dto);
  }

  @Post('historial-medico')
  async registrarConsulta(@Body() dto: RegistrarConsultaMedicaDto) {
    return this.registrarConsultaMedicaUseCase.ejecutar(dto);
  }

  @Get('mascotas/:mascotaId/historial-medico')
  async consultarHistorial(@Param('mascotaId') mascotaId: string) {
    return this.consultarHistorialMedicoUseCase.ejecutar(mascotaId);
  }
}
