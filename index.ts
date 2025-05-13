import { registerRootComponent } from 'expo';
import App from './App';

// Ignore non-fatal warnings
import { LogBox } from 'react-native';
LogBox.ignoreLogs([
  'Require cycle:',
  'Warning: componentWill',
]);

// For Expo projects, this is the preferred method
registerRootComponent(App);

export default App;