import { RolUsuario } from '../../../domain/value-objects/rol-usuario.enum';

export interface RegistrarUsuarioDto {
  email: string;
  password: string;
  nombre: string;
  rol: RolUsuario;
}
