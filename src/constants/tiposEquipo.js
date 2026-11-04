// Tipos de equipo iniciales (tabla TIPO_EQUIPOS).
// Las pantallas usan esta constante en vez de escribir los nombres a mano.
// El servicio la usa para precargar la colección si está vacía (ver cargarTiposIniciales).

export const TIPOS_EQUIPO = {
  SONIDO: 'Sonido',
  ILUMINACION: 'Iluminación',
  INFRAESTRUCTURA: 'Infraestructura',
};

// Lista para usar en selectores: ['Sonido', 'Iluminación', 'Infraestructura']
export const LISTA_TIPOS_EQUIPO = Object.values(TIPOS_EQUIPO);
