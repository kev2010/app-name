import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
  Image,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native";
import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import colors from "./assets/colors";
import Handle from "./components/Handle";
import Think from "./components/Think";
import BottomSheet from "@gorhom/bottom-sheet";
import Feed from "./components/Feed";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useAssets } from "expo-asset";

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
  const [swiped, setSwipe] = useState(false);

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

  // ref
  const bottomSheetRef = useRef(null);

  // variables
  const snapPoints = useMemo(() => ["10.5%", "70%"], []);

  const renderBackdrop = (props) => {
    return (
      <BottomSheetBackdrop {...props} pressBehavior={"collapse"} opacity={0.25}>
        <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }} />
      </BottomSheetBackdrop>
    );
  };

  const onPressSheet = () => {
    bottomSheetRef.current.snapToIndex(1);
    console.log("hello");
  };

  const handleBottomSheetSwipe = () => {
    Keyboard.dismiss;
    setSwipe(!swiped);
    console.log("logs", swiped);
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

      {/* <TouchableOpacity onPress={onPressSheet} style={styles.touchable}> */}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        onChange={handleBottomSheetSwipe}
        backgroundStyle={styles.sheet}
        backdropComponent={renderBackdrop}
        enabledContentTapInteraction={true}
        style={styles.sheet}
        handleComponent={({ animatedIndex, animatedPosition }) => (
          <Handle
            // animatedIndex={animatedIndex}
            // animatedPosition={animatedPosition}
            swiped={!swiped}
          />
        )} // WHYYY? TODO @RAPH
      >
        {/* <Pressable onPress={onPressSheet} style={{ flex: 1 }} /> */}
        {/* WHY??? */}
        {/* <View style={styles.contentContainer}> */}
        <Think swiped={!swiped}></Think>
        {/* </View> */}
      </BottomSheet>
      {/* </TouchableOpacity> */}
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
  touchable: {
    flex: 1,
    padding: 24,
  },
  sheet: {
    backgroundColor: colors.almost_white,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    flex: 1,
    elevation: 10,
  },
});
