export interface DatosNotificacion {
  citaId: string;
  fecha: Date;
  emailDuenio: string;
}

export interface CitaNotificacionQuery {
  obtenerDatosParaNotificar(citaId: string): Promise<DatosNotificacion | null>;

  /**
   * Resuelve los datos de notificación de todas las citas próximas
   * (dentro de `ventanaHoras`) en una sola operación batch, en vez de
   * invocar obtenerDatosParaNotificar() una vez por cita. Pensado para
   * cuando exista un cron/scheduler que recorra las citas próximas: sin
   * esto, un lote de N citas dispararía 3N consultas (cita, mascota,
   * dueño) en vez de un puñado de consultas en lote.
   */
  obtenerDatosParaNotificarLote(
    ventanaHoras: number,
  ): Promise<DatosNotificacion[]>;
}

export const CITA_NOTIFICACION_QUERY = Symbol('CITA_NOTIFICACION_QUERY');
