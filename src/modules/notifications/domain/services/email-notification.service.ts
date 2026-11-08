export interface EmailNotificationPayload {
  to: string;
  subject: string;
  body: string;
}

export interface EmailNotificationService {
  enviar(payload: EmailNotificationPayload): Promise<void>;
}

export const EMAIL_NOTIFICATION_SERVICE = Symbol('EMAIL_NOTIFICATION_SERVICE');
