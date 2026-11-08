export interface RegistroMedicoProps {
  id: string;
  mascotaId: string;
  veterinarioId: string;
  diagnostico: string;
  tratamiento?: string;
  notas?: string;
  fecha?: Date;
}

export class RegistroMedico {
  private readonly _id: string;
  private readonly _mascotaId: string;
  private readonly _veterinarioId: string;
  private readonly _diagnostico: string;
  private readonly _tratamiento?: string;
  private readonly _notas?: string;
  private readonly _fecha: Date;

  constructor(props: RegistroMedicoProps) {
    this._id = props.id;
    this._mascotaId = props.mascotaId;
    this._veterinarioId = props.veterinarioId;
    this._diagnostico = props.diagnostico;
    this._tratamiento = props.tratamiento;
    this._notas = props.notas;
    this._fecha = props.fecha ?? new Date();
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

  get diagnostico(): string {
    return this._diagnostico;
  }

  get tratamiento(): string | undefined {
    return this._tratamiento;
  }

  get notas(): string | undefined {
    return this._notas;
  }

  get fecha(): Date {
    return this._fecha;
  }
}
