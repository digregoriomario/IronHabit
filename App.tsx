import "react-native-gesture-handler";
import "./global.css";

import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppNavigator } from "./src/presentation/navigation/AppNavigator";
import { ThemeProvider } from "./src/presentation/theme/ThemeProvider";

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
