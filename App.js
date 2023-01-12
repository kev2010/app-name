import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import React, { useState, useCallback } from "react";
import colors from "./assets/colors";
import Thought from "./components/Thought";
import Feed from "./components/Feed";
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

  // TODO: Functions to load different screens
  // TODO: Empty state of feed
  const [globalFeed, setGlobal] = useState(false);
  const [friendsFeed, setFriends] = useState(true);
  const globalStyle = useGlobalStyle(globalFeed);
  const friendsStyle = useFriendsStyle(friendsFeed);

  const onPressGlobal = () => {
    if (!globalFeed) {
      setGlobal(true);
      setFriends(false);
    }
  };

  const onPressFriends = () => {
    if (!friendsFeed) {
      setGlobal(false);
      setFriends(true);
    }
  };

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
    <SafeAreaView style={styles.container} onLayout={onLayoutRootView}>
      <View style={styles.header}>
        <Text style={styles.title}>App Name</Text>
        <View style={styles.feed}>
          <TouchableOpacity onPress={onPressGlobal}>
            <Text style={[styles.type, globalStyle]}>Global</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onPressFriends}>
            <Text style={[styles.type, friendsStyle]}>Friends</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Feed></Feed>
    </SafeAreaView>
  );
}

const useGlobalStyle = (globalFeed) => {
  return {
    color: globalFeed ? colors.primary_4 : colors.gray_3,
    fontFamily: globalFeed ? "Nunito-Bold" : "Nunito-Regular",
  };
};

const useFriendsStyle = (friendsFeed) => {
  return {
    color: friendsFeed ? colors.primary_4 : colors.gray_3,
    fontFamily: friendsFeed ? "Nunito-Bold" : "Nunito-Regular",
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray_1,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginTop: 4,
  },
  title: {
    color: colors.primary_5,
    fontFamily: "Nunito-Bold",
    fontSize: 24,
  },
  feed: {
    marginTop: 16,
    marginBottom: 16,
    flexDirection: "row",
  },
  type: {
    fontSize: 16,
    marginHorizontal: 16,
  },
});
