// z (Zod): librería para validar los datos del formulario antes de guardarlos.
import { z } from 'zod';

// S6-04 — Esquema de validación del Perfil
// Se usa en la pantalla Mi perfil y en perfilService antes de guardar los cambios.
// Para validar solo algunos campos: perfilSchema.pick({ nombre: true, telefono: true }).

// Esquema del formulario: define qué campos tiene y qué reglas debe cumplir cada uno.
// abort: true corta la validación si el campo está vacío, así cada campo da un solo mensaje.
// Se usa con perfilSchema.safeParse(datos) para obtener los errores por campo.
export const perfilSchema = z.object({
  // Nombre completo: obligatorio y de 2 caracteres o más (sin contar espacios de más)
  nombre: z
    .string({ message: 'El nombre completo es obligatorio' })
    .trim()
    .min(1, { message: 'El nombre completo es obligatorio', abort: true })
    .min(2, 'El nombre completo debe tener al menos 2 caracteres'),

  // Email: obligatorio y con formato válido (ej: usuario@correo.com)
  // Se llama "email" para coincidir con el campo del documento en Firestore.
  email: z
    .string({ message: 'El correo electrónico es obligatorio' })
    .trim()
    .min(1, { message: 'El correo electrónico es obligatorio', abort: true })
    .email('El formato del correo electrónico no es válido'),

  // Teléfono: obligatorio, solo números y exactamente 10 dígitos (ej: 3874123452)
  // Se guarda como texto para no perder ceros a la izquierda.
  telefono: z
    .string({ message: 'El teléfono es obligatorio' })
    .trim()
    .min(1, { message: 'El teléfono es obligatorio', abort: true })
    .regex(/^\d{10}$/, 'El teléfono debe tener 10 números, sin espacios ni guiones'),
});