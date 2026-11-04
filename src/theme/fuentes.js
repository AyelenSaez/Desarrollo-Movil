// Fuente de toda la app: Work Sans (la misma que usa Figma).
// En Android "fontWeight" no elige el grosor de una fuente cargada a mano,
// por eso cada grosor es una fuente distinta y se usa con fontFamily.
//
// Uso en un estilo:  titulo: { fontFamily: FUENTES.bold, fontSize: 30 }

// Archivos de cada grosor que se cargan en App.js con useFonts
import {
  WorkSans_400Regular,
  WorkSans_500Medium,
  WorkSans_600SemiBold,
  WorkSans_700Bold,
  WorkSans_800ExtraBold,
} from '@expo-google-fonts/work-sans';

// Se le pasa a useFonts en App.js
export const ARCHIVOS_FUENTES = {
  WorkSans_400Regular,
  WorkSans_500Medium,
  WorkSans_600SemiBold,
  WorkSans_700Bold,
  WorkSans_800ExtraBold,
};

// Nombres para usar en los estilos (reemplazan a fontWeight)
export const FUENTES = {
  regular: 'WorkSans_400Regular',
  medium: 'WorkSans_500Medium',
  semibold: 'WorkSans_600SemiBold',
  bold: 'WorkSans_700Bold',
  extrabold: 'WorkSans_800ExtraBold',
};
