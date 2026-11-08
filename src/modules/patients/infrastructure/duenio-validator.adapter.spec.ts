import { DuenioValidatorAdapter } from './duenio-validator.adapter';
import { UsuarioRepository } from '../../identity/domain/repositories/usuario.repository';
import { Usuario } from '../../identity/domain/entities/usuario.entity';
import { RolUsuario } from '../../identity/domain/value-objects/rol-usuario.enum';

describe('DuenioValidatorAdapter', () => {
  let adapter: DuenioValidatorAdapter;
  let usuarioRepository: jest.Mocked<UsuarioRepository>;

  beforeEach(() => {
    usuarioRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UsuarioRepository>;

    adapter = new DuenioValidatorAdapter(usuarioRepository);
  });

  it('debe reportar existe:false cuando el usuario no existe', async () => {
    usuarioRepository.findById.mockResolvedValue(null);

    const resultado = await adapter.verificar('no-existe');

    expect(resultado).toEqual({ existe: false, esDuenio: false });
  });

  it('debe reportar esDuenio:true cuando el usuario existe y es OWNER', async () => {
    usuarioRepository.findById.mockResolvedValue(
      new Usuario({ id: 'u-1', nombre: 'Juan', rol: RolUsuario.OWNER }),
    );

    const resultado = await adapter.verificar('u-1');

    expect(resultado).toEqual({ existe: true, esDuenio: true });
  });

  it('debe reportar esDuenio:false cuando el usuario existe pero no es OWNER', async () => {
    usuarioRepository.findById.mockResolvedValue(
      new Usuario({
        id: 'u-2',
        nombre: 'Dra. López',
        rol: RolUsuario.VETERINARIO,
      }),
    );

    const resultado = await adapter.verificar('u-2');

    expect(resultado).toEqual({ existe: true, esDuenio: false });
  });
});
