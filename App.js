import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, View, Text } from "react-native";
import React, { useCallback } from "react";
import colors from "./assets/colors";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useAssets } from "expo-asset";
import { RecoilRoot } from "recoil";
import Nav from "./Nav";
import "react-native-gesture-handler";

export default function App() {
  // TODO: Either write out a whole ass test suite OR make a checklist of manual runs
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

  const [assets, error] = useAssets([
    require("./assets/handleIndicator.png"),
    require("./assets/back.png"),
    require("./assets/searchIcon.png"),
    require("./assets/default.jpeg"),
    require("./assets/audio.png"),
    require("./assets/camera.png"),
    require("./assets/remove.png"),
    require("./assets/friendsIcon.png"),
    require("./assets/lock.png"),
    require("./assets/delete.png"),
  ]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && !!assets) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, !!assets]);

  if (!fontsLoaded || !assets) {
    return null;
  }

  return (
    <React.Suspense
      fallback={
        <View>
          <Text>Loading</Text>
        </View>
      }
    >
      <RecoilRoot>
        <Nav onLayout={onLayoutRootView} />
      </RecoilRoot>
    </React.Suspense>
  );
}
