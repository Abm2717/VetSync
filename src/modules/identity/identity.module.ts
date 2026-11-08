import { Module } from '@nestjs/common';
import { USUARIO_REPOSITORY } from './domain/repositories/usuario.repository';
import { PASSWORD_HASHER } from './domain/services/password-hasher';
import { TOKEN_GENERATOR } from './domain/services/token-generator';
import { PrismaUsuarioRepository } from './infrastructure/prisma-usuario.repository';
import { BcryptPasswordHasher } from './infrastructure/bcrypt-password-hasher';
import { JwtTokenGenerator } from './infrastructure/jwt-token-generator.service';
import { RegistrarUsuarioUseCase } from './application/use-cases/registrar-usuario.use-case';
import { AutenticarUsuarioUseCase } from './application/use-cases/autenticar-usuario.use-case';
import { IdentityController } from './presentation/identity.controller';

@Module({
  controllers: [IdentityController],
  providers: [
    { provide: USUARIO_REPOSITORY, useClass: PrismaUsuarioRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_GENERATOR, useClass: JwtTokenGenerator },
    RegistrarUsuarioUseCase,
    AutenticarUsuarioUseCase,
  ],
  exports: [USUARIO_REPOSITORY],
})
export class IdentityModule {}
