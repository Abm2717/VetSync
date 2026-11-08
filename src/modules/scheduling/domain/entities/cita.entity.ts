import {
  CitaYaCanceladaException,
  CitaYaFinalizadaException,
  FechaPasadaException,
} from '../exceptions';

export enum EstadoCita {
  PROGRAMADA = 'PROGRAMADA',
  CANCELADA = 'CANCELADA',
  COMPLETADA = 'COMPLETADA',
}

export interface CitaProps {
  id: string;
  mascotaId: string;
  veterinarioId: string;
  fecha: Date;
  estado?: EstadoCita;
}

/**
 * Entidad de dominio. Encapsula las reglas de negocio propias de una cita
 * (p. ej. qué significa "cancelar"), para que los casos de uso solo orquesten.
 */
export class Cita {
  private readonly _id: string;
  private readonly _mascotaId: string;
  private readonly _veterinarioId: string;
  private _fecha: Date;
  private _estado: EstadoCita;

  constructor(props: CitaProps) {
    this._id = props.id;
    this._mascotaId = props.mascotaId;
    this._veterinarioId = props.veterinarioId;
    this._fecha = props.fecha;
    this._estado = props.estado ?? EstadoCita.PROGRAMADA;
  }

  get id(): string {
    return this._id;
  }

  get mascotaId(): string {
    return this._mascotaId;
  }

  get veterinarioId(): string {
    return this._veterinarioId;
  }

  get fecha(): Date {
    return this._fecha;
  }

  get estado(): EstadoCita {
    return this._estado;
  }

  private yaPaso(): boolean {
    return this._fecha.getTime() < Date.now();
  }

  /**
   * Cancela la cita si las reglas de negocio lo permiten.
   * Lanza una excepción de dominio en caso contrario.
   */
  cancelar(): void {
    if (this._estado === EstadoCita.CANCELADA) {
      throw new CitaYaCanceladaException(this._id);
    }

    if (this.yaPaso()) {
      throw new CitaYaFinalizadaException(this._id);
    }

    this._estado = EstadoCita.CANCELADA;
  }

  /**
   * Reagenda la cita a una nueva fecha si las reglas de negocio lo permiten.
   * La validación de choque de horario con otras citas la hace el caso de uso
   * (requiere consultar el repositorio), no la entidad.
   */
  reagendar(nuevaFecha: Date): void {
    if (this._estado === EstadoCita.CANCELADA) {
      throw new CitaYaCanceladaException(this._id);
    }

    if (nuevaFecha.getTime() < Date.now()) {
      throw new FechaPasadaException();
    }

    this._fecha = nuevaFecha;
  }
}
