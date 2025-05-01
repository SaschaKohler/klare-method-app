import { registerRootComponent } from "expo";
import { LogBox } from "react-native";

// Suppress MMKV error when using remote debugging
LogBox.ignoreLogs([
  "MMKV initialization failed",
  "Failed to create a new MMKV instance",
  "React Native is not running on-device",
]);

// Import our storage utility to initialize it early
// import './src/utils/storage';
import App from "./App";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
