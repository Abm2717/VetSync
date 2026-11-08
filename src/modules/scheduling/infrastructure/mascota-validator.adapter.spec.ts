import { MascotaValidatorAdapter } from './mascota-validator.adapter';
import { MascotaRepository } from '../../patients/domain/repositories/mascota.repository';

describe('MascotaValidatorAdapter', () => {
  let adapter: MascotaValidatorAdapter;
  let mascotaRepository: jest.Mocked<MascotaRepository>;

  beforeEach(() => {
    mascotaRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<MascotaRepository>;

    adapter = new MascotaValidatorAdapter(mascotaRepository);
  });

  it('debe retornar true si la mascota existe', async () => {
    mascotaRepository.findById.mockResolvedValue({ id: 'm-1' } as any);

    await expect(adapter.existe('m-1')).resolves.toBe(true);
  });

  it('debe retornar false si la mascota no existe', async () => {
    mascotaRepository.findById.mockResolvedValue(null);

    await expect(adapter.existe('no-existe')).resolves.toBe(false);
  });
});
