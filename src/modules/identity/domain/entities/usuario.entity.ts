import { RolUsuario } from '../value-objects/rol-usuario.enum';

export interface UsuarioProps {
  id: string;
  nombre: string;
  rol: RolUsuario;
  email?: string;
  password?: string;
}

export class Usuario {
  private readonly _id: string;
  private readonly _nombre: string;
  private readonly _rol: RolUsuario;
  private readonly _email?: string;
  private readonly _password?: string;

  constructor(props: UsuarioProps) {
    this._id = props.id;
    this._nombre = props.nombre;
    this._rol = props.rol;
    this._email = props.email;
    this._password = props.password;
  }

  get id(): string {
    return this._id;
  }

  get nombre(): string {
    return this._nombre;
  }

  get rol(): RolUsuario {
    return this._rol;
  }

  get email(): string | undefined {
    return this._email;
  }

  get password(): string | undefined {
    return this._password;
  }

  esDuenio(): boolean {
    return this._rol === RolUsuario.OWNER;
  }

  esVeterinario(): boolean {
    return this._rol === RolUsuario.VETERINARIO;
  }
}
