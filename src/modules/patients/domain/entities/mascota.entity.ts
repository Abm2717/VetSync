export interface MascotaProps {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  fechaNacimiento: Date;
  duenioId: string;
}

export class Mascota {
  private readonly _id: string;
  private readonly _nombre: string;
  private readonly _especie: string;
  private readonly _raza: string;
  private readonly _fechaNacimiento: Date;
  private readonly _duenioId: string;

  constructor(props: MascotaProps) {
    this._id = props.id;
    this._nombre = props.nombre;
    this._especie = props.especie;
    this._raza = props.raza;
    this._fechaNacimiento = props.fechaNacimiento;
    this._duenioId = props.duenioId;
  }

  get id(): string {
    return this._id;
  }

  get nombre(): string {
    return this._nombre;
  }

  get especie(): string {
    return this._especie;
  }

  get raza(): string {
    return this._raza;
  }

  get fechaNacimiento(): Date {
    return this._fechaNacimiento;
  }

  get duenioId(): string {
    return this._duenioId;
  }
}
