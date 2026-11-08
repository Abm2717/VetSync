export class CredencialesInvalidasException extends Error {
  constructor() {
    super('Credenciales inválidas.');
    this.name = 'CredencialesInvalidasException';
  }
}

export class EmailYaRegistradoException extends Error {
  constructor(email: string) {
    super(`El email "${email}" ya está registrado.`);
    this.name = 'EmailYaRegistradoException';
  }
}

export class RolInvalidoException extends Error {
  constructor(rol: string) {
    super(`El rol "${rol}" no es válido. Debe ser OWNER o VETERINARIO.`);
    this.name = 'RolInvalidoException';
  }
}
