import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
} from "react-native";
import React, { useState, useCallback } from "react";
import colors from "./assets/colors";
import Thought from "./components/Thought";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function App() {
  // const [refreshing, setRefreshing] = React.useState(false);

  // const onRefresh = () => {
  //   setRefreshing(true);
  //   setItems([...Items, { key: 69, item: "item 69" }]);
  //   setRefreshing(false);
  // };

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

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      onLayout={onLayoutRootView}
      // contentContainerStyle={styles.container}
      // refreshControl={
      //   <RefreshControl
      //     refreshing={refreshing}
      //     onRefresh={onRefresh}
      //     colors={["#ff00ff"]}
      //   />
      // }
    >
      <View style={styles.thoughts}>
        <Thought></Thought>
        <Thought></Thought>
        <Thought></Thought>
        <Thought></Thought>
        <Thought></Thought>
        <Thought></Thought>
        <Thought></Thought>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray_1,
  },
  thoughts: {
    alignItems: "center",
  },
});
