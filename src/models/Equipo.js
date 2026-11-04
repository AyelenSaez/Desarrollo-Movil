import { z } from 'zod';

// Modelos de las tablas EQUIPOS, TIPO_EQUIPOS y ESTADOS_EQUIPOS.
// En Firestore cada fila es un documento y su id es el id del documento (string),
// por eso los id del diagrama (INT) acá son strings.

// Nombres de las colecciones en Firestore
export const COLECCIONES = {
  EQUIPOS: 'equipos',
  TIPOS_EQUIPOS: 'tipo_equipos',
  ESTADOS_EQUIPOS: 'estados_equipos',
};

/**
 * Tabla EQUIPOS
 * @typedef {Object} Equipo
 * @property {string} id_equipo        PK (id del documento)
 * @property {string} id_tipoeq        FK -> TipoEquipo
 * @property {string} id_estadoeq      FK -> EstadoEquipo
 * @property {string} nombre_equipo
 * @property {number} cantidad_equipo  entero, 0 o más
 */

/**
 * Tabla TIPO_EQUIPOS
 * @typedef {Object} TipoEquipo
 * @property {string} id_tipoeq        PK (id del documento)
 * @property {string} nombre_tipoeq
 */

/**
 * Tabla ESTADOS_EQUIPOS
 * @typedef {Object} EstadoEquipo
 * @property {string} id_estadoeq      PK (id del documento)
 * @property {string} nombre_estadoeq
 */

const OBLIGATORIO = 'Este campo es obligatorio';

// Validaciones de los datos que se guardan (sin el id, que lo genera Firestore)
export const equipoSchema = z.object({
  id_tipoeq: z.string().min(1, OBLIGATORIO),
  id_estadoeq: z.string().min(1, OBLIGATORIO),
  nombre_equipo: z.string().trim().min(1, OBLIGATORIO),
  cantidad_equipo: z.coerce
    .number({ message: 'La cantidad debe ser un número' })
    .int('La cantidad debe ser un número entero')
    .min(0, 'La cantidad no puede ser negativa'),
});

export const tipoEquipoSchema = z.object({
  nombre_tipoeq: z.string().trim().min(1, OBLIGATORIO),
});

export const estadoEquipoSchema = z.object({
  nombre_estadoeq: z.string().trim().min(1, OBLIGATORIO),
});
