import { Test, TestingModule } from '@nestjs/testing';
import { EnviarNotificacionCitaUseCase } from './enviar-notificacion-cita.use-case';
import {
  CitaNotificacionQuery,
  CITA_NOTIFICACION_QUERY,
} from '../../domain/services/cita-notificacion-query';
import {
  EmailNotificationService,
  EMAIL_NOTIFICATION_SERVICE,
} from '../../domain/services/email-notification.service';

describe('EnviarNotificacionCitaUseCase', () => {
  let useCase: EnviarNotificacionCitaUseCase;
  let citaQuery: jest.Mocked<CitaNotificacionQuery>;
  let emailService: jest.Mocked<EmailNotificationService>;

  beforeEach(async () => {
    const citaQueryMock: jest.Mocked<CitaNotificacionQuery> = {
      obtenerDatosParaNotificar: jest.fn(),
    } as unknown as jest.Mocked<CitaNotificacionQuery>;

    const emailServiceMock: jest.Mocked<EmailNotificationService> = {
      enviar: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnviarNotificacionCitaUseCase,
        { provide: CITA_NOTIFICACION_QUERY, useValue: citaQueryMock },
        { provide: EMAIL_NOTIFICATION_SERVICE, useValue: emailServiceMock },
      ],
    }).compile();

    useCase = module.get(EnviarNotificacionCitaUseCase);
    citaQuery = module.get(CITA_NOTIFICACION_QUERY);
    emailService = module.get(EMAIL_NOTIFICATION_SERVICE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe enviar la notificación cuando la consulta devuelve datos', async () => {
    citaQuery.obtenerDatosParaNotificar.mockResolvedValue({
      citaId: 'cita-1',
      fecha: new Date('2026-11-09T10:00:00Z'),
      emailDuenio: 'duenio@example.com',
    });

    await useCase.ejecutar('cita-1');

    expect(citaQuery.obtenerDatosParaNotificar).toHaveBeenCalledWith('cita-1');
    expect(emailService.enviar).toHaveBeenCalledTimes(1);
    expect(emailService.enviar).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'duenio@example.com' }),
    );
  });

  it('no debe enviar la notificación cuando la consulta devuelve null', async () => {
    citaQuery.obtenerDatosParaNotificar.mockResolvedValue(null);

    await useCase.ejecutar('cita-2');

    expect(emailService.enviar).not.toHaveBeenCalled();
  });
});
