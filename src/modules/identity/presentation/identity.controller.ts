import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegistrarUsuarioUseCase } from '../application/use-cases/registrar-usuario.use-case';
import { AutenticarUsuarioUseCase } from '../application/use-cases/autenticar-usuario.use-case';
import { RegistrarUsuarioDto } from '../application/use-cases/dto/registrar-usuario.dto';
import { AutenticarUsuarioInput } from '../application/use-cases/autenticar-usuario.use-case';

@Controller('identity')
export class IdentityController {
  constructor(
    private readonly registrarUsuarioUseCase: RegistrarUsuarioUseCase,
    private readonly autenticarUsuarioUseCase: AutenticarUsuarioUseCase,
  ) {}

  @Post('registro')
  async registrar(@Body() dto: RegistrarUsuarioDto) {
    const usuario = await this.registrarUsuarioUseCase.ejecutar(dto);
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: AutenticarUsuarioInput) {
    return this.autenticarUsuarioUseCase.ejecutar(dto);
  }
}
