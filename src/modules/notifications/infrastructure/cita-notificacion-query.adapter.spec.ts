import { CitaNotificacionQueryAdapter } from './cita-notificacion-query.adapter';
import {
  CitaRepository,
} from '../../scheduling/domain/repositories/cita.repository';
import {
  Cita,
  EstadoCita,
} from '../../scheduling/domain/entities/cita.entity';
import {
  MascotaRepository,
} from '../../patients/domain/repositories/mascota.repository';
import { Mascota } from '../../patients/domain/entities/mascota.entity';
import {
  UsuarioRepository,
} from '../../identity/domain/repositories/usuario.repository';
import { Usuario } from '../../identity/domain/entities/usuario.entity';
import { RolUsuario } from '../../identity/domain/value-objects/rol-usuario.enum';

describe('CitaNotificacionQueryAdapter', () => {
  let adapter: CitaNotificacionQueryAdapter;
  let citaRepository: jest.Mocked<CitaRepository>;
  let mascotaRepository: jest.Mocked<MascotaRepository>;
  let usuarioRepository: jest.Mocked<UsuarioRepository>;

  // "Ahora" fijo para que las pruebas sean deterministas respecto a la ventana de 24h
  const AHORA = new Date('2026-11-08T12:00:00Z');

  const mascota = new Mascota({
    id: 'mascota-1',
    nombre: 'Firulais',
    especie: 'Perro',
    raza: 'Labrador',
    fechaNacimiento: new Date('2022-01-01'),
    duenioId: 'duenio-1',
  });

  const duenio = new Usuario({
    id: 'duenio-1',
    nombre: 'Dueño de Prueba',
    email: 'duenio@example.com',
    rol: RolUsuario.OWNER,
  });

  beforeEach(() => {
    citaRepository = {
      findById: jest.fn(),
      findProximasEnVentana: jest.fn(),
    } as unknown as jest.Mocked<CitaRepository>;

    mascotaRepository = {
      findById: jest.fn(),
      findByIds: jest.fn(),
    } as unknown as jest.Mocked<MascotaRepository>;

    usuarioRepository = {
      findById: jest.fn(),
      findByIds: jest.fn(),
    } as unknown as jest.Mocked<UsuarioRepository>;

    adapter = new CitaNotificacionQueryAdapter(
      citaRepository,
      mascotaRepository,
      usuarioRepository,
    );

    mascotaRepository.findById.mockResolvedValue(mascota);
    usuarioRepository.findById.mockResolvedValue(duenio);

    jest.useFakeTimers().setSystemTime(AHORA);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('debe devolver los datos si la cita está dentro de la ventana de 24h', async () => {
    const cita = new Cita({
      id: 'cita-1',
      mascotaId: 'mascota-1',
      veterinarioId: 'vet-1',
      fecha: new Date('2026-11-09T10:00:00Z'), // 22h desde AHORA
      estado: EstadoCita.PROGRAMADA,
    });
    citaRepository.findById.mockResolvedValue(cita);

    const resultado = await adapter.obtenerDatosParaNotificar(cita.id);

    expect(citaRepository.findById).toHaveBeenCalledWith(cita.id);
    expect(resultado).toEqual({
      citaId: cita.id,
      fecha: cita.fecha,
      emailDuenio: 'duenio@example.com',
    });
  });

  it('debe devolver null si la cita está fuera de la ventana todavía', async () => {
    const cita = new Cita({
      id: 'cita-2',
      mascotaId: 'mascota-1',
      veterinarioId: 'vet-1',
      fecha: new Date('2026-11-12T10:00:00Z'), // más de 24h desde AHORA
      estado: EstadoCita.PROGRAMADA,
    });
    citaRepository.findById.mockResolvedValue(cita);

    const resultado = await adapter.obtenerDatosParaNotificar(cita.id);

    expect(resultado).toBeNull();
  });

  it('debe devolver null si la cita ya fue cancelada', async () => {
    const cita = new Cita({
      id: 'cita-3',
      mascotaId: 'mascota-1',
      veterinarioId: 'vet-1',
      fecha: new Date('2026-11-09T10:00:00Z'), // dentro de la ventana
      estado: EstadoCita.CANCELADA,
    });
    citaRepository.findById.mockResolvedValue(cita);

    const resultado = await adapter.obtenerDatosParaNotificar(cita.id);

    expect(resultado).toBeNull();
  });

  it('debe devolver null si la cita no existe', async () => {
    citaRepository.findById.mockResolvedValue(null);

    const resultado = await adapter.obtenerDatosParaNotificar('no-existe');

    expect(resultado).toBeNull();
  });

  describe('obtenerDatosParaNotificarLote', () => {
    it('debe devolver un arreglo vacío sin consultar mascotas/dueños si no hay citas próximas', async () => {
      citaRepository.findProximasEnVentana.mockResolvedValue([]);

      const resultado = await adapter.obtenerDatosParaNotificarLote(24);

      expect(resultado).toEqual([]);
      expect(mascotaRepository.findByIds).not.toHaveBeenCalled();
      expect(usuarioRepository.findByIds).not.toHaveBeenCalled();
    });

    it('debe resolver mascotas y dueños en una sola consulta por lote, incluso con varias citas de la misma mascota', async () => {
      const cita1 = new Cita({
        id: 'cita-1',
        mascotaId: 'mascota-1',
        veterinarioId: 'vet-1',
        fecha: new Date('2026-11-09T10:00:00Z'),
        estado: EstadoCita.PROGRAMADA,
      });
      const cita2 = new Cita({
        id: 'cita-2',
        mascotaId: 'mascota-1', // misma mascota que cita1, no debe duplicar la consulta
        veterinarioId: 'vet-2',
        fecha: new Date('2026-11-09T14:00:00Z'),
        estado: EstadoCita.PROGRAMADA,
      });

      citaRepository.findProximasEnVentana.mockResolvedValue([cita1, cita2]);
      mascotaRepository.findByIds.mockResolvedValue([mascota]);
      usuarioRepository.findByIds.mockResolvedValue([duenio]);

      const resultado = await adapter.obtenerDatosParaNotificarLote(24);

      expect(mascotaRepository.findByIds).toHaveBeenCalledTimes(1);
      expect(mascotaRepository.findByIds).toHaveBeenCalledWith(['mascota-1']);
      expect(usuarioRepository.findByIds).toHaveBeenCalledTimes(1);
      expect(usuarioRepository.findByIds).toHaveBeenCalledWith(['duenio-1']);
      expect(resultado).toEqual([
        { citaId: 'cita-1', fecha: cita1.fecha, emailDuenio: 'duenio@example.com' },
        { citaId: 'cita-2', fecha: cita2.fecha, emailDuenio: 'duenio@example.com' },
      ]);
    });

    it('debe omitir citas cuya mascota o dueño no se pudieron resolver', async () => {
      const citaSinMascota = new Cita({
        id: 'cita-huerfana',
        mascotaId: 'mascota-inexistente',
        veterinarioId: 'vet-1',
        fecha: new Date('2026-11-09T10:00:00Z'),
        estado: EstadoCita.PROGRAMADA,
      });

      citaRepository.findProximasEnVentana.mockResolvedValue([
        citaSinMascota,
      ]);
      mascotaRepository.findByIds.mockResolvedValue([]); // no se encontró
      usuarioRepository.findByIds.mockResolvedValue([]);

      const resultado = await adapter.obtenerDatosParaNotificarLote(24);

      expect(resultado).toEqual([]);
    });
  });
});
