export interface RegistrarConsultaMedicaDto {
  mascotaId: string;
  veterinarioId: string;
  diagnostico: string;
  tratamiento?: string;
  notas?: string;
}
