// Punto de entrada de la aplicación: es el primer archivo que ejecuta Expo.

// registerRootComponent: función de Expo que registra el componente principal de la app.
import { registerRootComponent } from 'expo';

// App: componente raíz que contiene toda la aplicación (ver App.js).
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
