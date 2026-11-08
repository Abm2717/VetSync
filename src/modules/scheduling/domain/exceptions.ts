export class CitaNoEncontradaException extends Error {
  constructor(citaId: string) {
    super(`No se encontró la cita con id "${citaId}".`);
    this.name = 'CitaNoEncontradaException';
  }
}

export class CitaYaCanceladaException extends Error {
  constructor(citaId: string) {
    super(`La cita con id "${citaId}" ya había sido cancelada previamente.`);
    this.name = 'CitaYaCanceladaException';
  }
}

export class CitaYaFinalizadaException extends Error {
  constructor(citaId: string) {
    super(`La cita con id "${citaId}" ya ocurrió y no puede cancelarse.`);
    this.name = 'CitaYaFinalizadaException';
  }
}

export class FechaPasadaException extends Error {
  constructor() {
    super('La fecha de la cita no puede estar en el pasado.');
    this.name = 'FechaPasadaException';
  }
}

export class HorarioOcupadoException extends Error {
  constructor() {
    super('El veterinario ya tiene una cita agendada en ese horario.');
    this.name = 'HorarioOcupadoException';
  }
}

export class MascotaNoEncontradaException extends Error {
  constructor(mascotaId: string) {
    super(`La mascota con id ${mascotaId} no fue encontrada.`);
    this.name = 'MascotaNoEncontradaException';
  }
}

export class VeterinarioNoEncontradoException extends Error {
  constructor(veterinarioId: string) {
    super(`El veterinario con id ${veterinarioId} no fue encontrado.`);
    this.name = 'VeterinarioNoEncontradoException';
  }
}
