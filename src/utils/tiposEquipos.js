
export const TIPOS_EQUIPO = {
  SONIDO: 'Sonido',
  ILUMINACION: 'Iluminación',
  INFRAESTRUCTURA: 'Infraestructura',
};
 
// Lista para usar en selectores: ['Sonido', 'Iluminación', 'Infraestructura']
export const LISTA_TIPOS_EQUIPO = Object.values(TIPOS_EQUIPO);
 

 //Devuelve los tipos de equipo fijos para cargar el selector «Tipo» de los formularios de registro y modificación, sin consultar la base de datos.
 //Devuelve una copia, así quien la use no puede modificar la lista original por error.

export const obtenerTiposEquipoFijos = () => [...LISTA_TIPOS_EQUIPO];