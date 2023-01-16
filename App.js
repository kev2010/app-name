import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet } from "react-native";
import React, { useCallback } from "react";
import colors from "./assets/colors";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import HomeScreen from "./screens/HomeScreen";
import { useAssets } from "expo-asset";

SplashScreen.preventAutoHideAsync();

export default function App() {
  // TODO: handle might be screwed lol

  const [fontsLoaded] = useFonts({
    "Nunito-Black": require("./assets/fonts/Nunito-Black.ttf"),
    "Nunito-Bold": require("./assets/fonts/Nunito-Bold.ttf"),
    "Nunito-ExtraBold": require("./assets/fonts/Nunito-ExtraBold.ttf"),
    "Nunito-ExtraLight": require("./assets/fonts/Nunito-ExtraLight.ttf"),
    "Nunito-Light": require("./assets/fonts/Nunito-Light.ttf"),
    "Nunito-Medium": require("./assets/fonts/Nunito-Medium.ttf"),
    "Nunito-Regular": require("./assets/fonts/Nunito-Regular.ttf"),
    "Nunito-SemiBold": require("./assets/fonts/Nunito-SemiBold.ttf"),
  });

  const [assets, error] = useAssets([require("./assets/handleIndicator.png")]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && !!assets) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, !!assets]);

  if (!fontsLoaded || !assets) {
    return null;
  }

  return (
    <HomeScreen onLayout={onLayoutRootView} />
    // <SafeAreaView style={styles.container} onLayout={onLayoutRootView}>
    //
    // </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray_1,
    alignItems: "center",
  },
});
