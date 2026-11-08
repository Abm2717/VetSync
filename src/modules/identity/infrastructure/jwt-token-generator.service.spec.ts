import * as jwt from 'jsonwebtoken';
import { JwtTokenGenerator } from './jwt-token-generator.service';

describe('JwtTokenGenerator', () => {
  const SECRETO_PRUEBA = 'secreto-de-prueba-no-usar-en-produccion';
  const ORIGINAL_JWT_SECRET = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = SECRETO_PRUEBA;
  });

  afterEach(() => {
    process.env.JWT_SECRET = ORIGINAL_JWT_SECRET;
  });

  it('debe generar un JWT firmado cuyo payload contenga el id del usuario', () => {
    const generator = new JwtTokenGenerator();

    const token = generator.generar('usr-001');
    const payload = jwt.verify(token, SECRETO_PRUEBA) as { sub: string };

    expect(payload.sub).toBe('usr-001');
  });

  it('debe generar un token con tiempo de expiración', () => {
    const generator = new JwtTokenGenerator();

    const token = generator.generar('usr-001');
    const decoded = jwt.decode(token) as { exp?: number; iat?: number };

    expect(decoded.exp).toBeDefined();
    expect(decoded.iat).toBeDefined();
    expect(decoded.exp as number).toBeGreaterThan(decoded.iat as number);
  });

  it('no debe poder verificarse con un secreto distinto (no es forjable)', () => {
    const generator = new JwtTokenGenerator();
    const token = generator.generar('usr-001');

    expect(() => jwt.verify(token, 'otro-secreto-cualquiera')).toThrow();
  });

  it('debe lanzar un error claro si JWT_SECRET no está configurado', () => {
    delete process.env.JWT_SECRET;
    const generator = new JwtTokenGenerator();

    expect(() => generator.generar('usr-001')).toThrow(/JWT_SECRET/);
  });
});
