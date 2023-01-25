import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, View } from "react-native";
import React, { useCallback } from "react";
import colors from "./assets/colors";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useAssets } from "expo-asset";
import { RecoilRoot } from "recoil";
import Nav from "./Nav";

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
    require("./assets/remove.png"),
    require("./assets/friendsIcon.png"),
  ]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && !!assets) {
      console.log("whats going on");
      await SplashScreen.hideAsync();
    }
    console.log("ok");
  }, [fontsLoaded, !!assets]);

  if (!fontsLoaded || !assets) {
    return null;
  }

  return (
    <RecoilRoot>
      <Nav onLayout={onLayoutRootView} />
    </RecoilRoot>
  );
}

const styles = StyleSheet.create({});
