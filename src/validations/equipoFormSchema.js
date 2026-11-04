import { z } from 'zod';
import { LISTA_TIPOS_EQUIPO } from '../constants/tiposEquipo';

// S4-07 — Esquema de validación de Equipos
// Se reutiliza en los formularios de REGISTRO y de MODIFICACIÓN de equipos.

// Estados posibles de un equipo (tienen que coincidir con los de Figma)
export const LISTA_ESTADOS_EQUIPO = ['Disponible', 'En uso', 'En reparación', 'Fuera de servicio'];

export const equipoFormSchema = z.object({
  // Nombre: obligatorio (se le sacan los espacios de más)
  nombre: z
    .string({ message: 'El nombre es obligatorio' })
    .trim()
    .min(1, 'El nombre es obligatorio'),

  // Tipo: solo Sonido, Iluminación o Infraestructura
  tipo: z.enum(LISTA_TIPOS_EQUIPO, {
    message: 'Elegí un tipo: Sonido, Iluminación o Infraestructura',
  }),

  // Cantidad: número entero, 0 o más (si viene vacío, da error)
  cantidad: z.preprocess(
    (valor) => (valor === '' || valor === null ? undefined : valor),
    z.coerce
      .number({ message: 'La cantidad es obligatoria y debe ser un número' })
      .int('La cantidad debe ser un número entero')
      .min(0, 'La cantidad no puede ser negativa')
  ),

  // Estado: solo uno de la lista de arriba
  estado: z.enum(LISTA_ESTADOS_EQUIPO, { message: 'Elegí un estado válido' }),
});