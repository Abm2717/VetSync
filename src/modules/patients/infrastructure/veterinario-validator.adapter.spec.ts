import { VeterinarioValidatorAdapter } from './veterinario-validator.adapter';
import { UsuarioRepository } from '../../identity/domain/repositories/usuario.repository';
import { Usuario } from '../../identity/domain/entities/usuario.entity';
import { RolUsuario } from '../../identity/domain/value-objects/rol-usuario.enum';

describe('VeterinarioValidatorAdapter', () => {
  let adapter: VeterinarioValidatorAdapter;
  let usuarioRepository: jest.Mocked<UsuarioRepository>;

  beforeEach(() => {
    usuarioRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UsuarioRepository>;

    adapter = new VeterinarioValidatorAdapter(usuarioRepository);
  });

  it('debe reportar existe:false cuando el usuario no existe', async () => {
    usuarioRepository.findById.mockResolvedValue(null);

    const resultado = await adapter.verificar('no-existe');

    expect(resultado).toEqual({ existe: false, esVeterinario: false });
  });

  it('debe reportar esVeterinario:true cuando el usuario existe y es VETERINARIO', async () => {
    usuarioRepository.findById.mockResolvedValue(
      new Usuario({
        id: 'v-1',
        nombre: 'Dra. López',
        rol: RolUsuario.VETERINARIO,
      }),
    );

    const resultado = await adapter.verificar('v-1');

    expect(resultado).toEqual({ existe: true, esVeterinario: true });
  });

  it('debe reportar esVeterinario:false cuando el usuario existe pero no es VETERINARIO', async () => {
    usuarioRepository.findById.mockResolvedValue(
      new Usuario({ id: 'o-1', nombre: 'Juan Pérez', rol: RolUsuario.OWNER }),
    );

    const resultado = await adapter.verificar('o-1');

    expect(resultado).toEqual({ existe: true, esVeterinario: false });
  });
});
