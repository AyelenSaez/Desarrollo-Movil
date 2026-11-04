// z (Zod): librería para validar los datos del formulario antes de guardarlos.
import { z } from 'zod';
// LISTA_TIPOS_EQUIPO: tipos permitidos (Sonido, Iluminación, Infraestructura).
import { LISTA_TIPOS_EQUIPO } from '../constants/tiposEquipo';

// S4-07 — Esquema de validación de Equipos
// Se reutiliza en los formularios de REGISTRO y de MODIFICACIÓN de equipos.

// Estados posibles de un equipo (tienen que coincidir con los de Figma)
export const LISTA_ESTADOS_EQUIPO = ['Disponible', 'En uso', 'En reparación', 'Fuera de servicio'];

// Esquema del formulario: define qué campos tiene y qué reglas debe cumplir cada uno.
// Se usa con equipoFormSchema.safeParse(datos) para obtener los errores por campo.
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
  // z.preprocess transforma el valor antes de validarlo ('' o null pasan a undefined)
  cantidad: z.preprocess(
    (valor) => (valor === '' || valor === null ? undefined : valor),
    z.coerce
      .number({ message: 'La cantidad es obligatoria y debe ser un número' })
      .int('La cantidad debe ser un número entero')
      .min(0, 'La cantidad no puede ser negativa')
  ),

  // Estado: solo uno de la lista de arriba
  estado: z.enum(LISTA_ESTADOS_EQUIPO, { message: 'Elegí un estado válido' }),

  // Descripción: opcional (ej: "Original")
  descripcion: z.string().trim().optional(),
});