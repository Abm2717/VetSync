import { VeterinarioValidatorAdapter } from './veterinario-validator.adapter';
import { UsuarioRepository } from '../../identity/domain/repositories/usuario.repository';

describe('VeterinarioValidatorAdapter', () => {
  let adapter: VeterinarioValidatorAdapter;
  let usuarioRepository: jest.Mocked<UsuarioRepository>;

  beforeEach(() => {
    usuarioRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UsuarioRepository>;

    adapter = new VeterinarioValidatorAdapter(usuarioRepository);
  });

  it('debe retornar true si el veterinario existe', async () => {
    usuarioRepository.findById.mockResolvedValue({ id: 'v-1' } as any);

    await expect(adapter.existe('v-1')).resolves.toBe(true);
  });

  it('debe retornar false si el veterinario no existe', async () => {
    usuarioRepository.findById.mockResolvedValue(null);

    await expect(adapter.existe('no-existe')).resolves.toBe(false);
  });
});
