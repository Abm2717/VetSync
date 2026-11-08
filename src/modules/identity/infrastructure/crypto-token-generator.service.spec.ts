import { CryptoTokenGenerator } from './crypto-token-generator.service';

describe('CryptoTokenGenerator', () => {
  it('debe generar un token que incluya el id del usuario', () => {
    const generator = new CryptoTokenGenerator();

    const token = generator.generar('usr-001');

    expect(typeof token).toBe('string');
    expect(token.endsWith('.usr-001')).toBe(true);
  });

  it('debe generar tokens distintos en llamadas consecutivas', () => {
    const generator = new CryptoTokenGenerator();

    const token1 = generator.generar('usr-001');
    const token2 = generator.generar('usr-001');

    expect(token1).not.toBe(token2);
  });
});
