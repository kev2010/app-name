import { StatusBar } from "expo-status-bar";
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Keyboard,
  Pressable,
} from "react-native";
import Handle from "../components/Handle";
import React, { useState, useRef, useMemo } from "react";
import colors from "../assets/colors";
import Thought from "../components/Thought";
import ReactionSection from "../components/ReactionSection";
import BottomSheet from "@gorhom/bottom-sheet";
import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";

// TODO: Fix that tapping outside of the keyboard doesn't make the keyboard go away
const ReactionsScreen = ({ navigation, route }) => {
  const [swiped, setSwipe] = useState(false);
  // TODO: Make sure that going back to home doesn't reset the thread and scroll up
  // TODO: Unclutter like in HomeScreen by moving bottom sheet to a separate
  const goBack = () => {
    navigation.navigate("Home");
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

  const handleBottomSheetSwipe = () => {
    Keyboard.dismiss;
    setSwipe(!swiped);
    console.log("logs", swiped);
  };

  const onPressSheet = () => {
    bottomSheetRef.current.snapToIndex(!swiped ? 0 : 1);
    console.log("hello", swiped);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={"light-content"} />
      <View style={styles.header}>
        <Text style={styles.title}>Thought</Text>
        <View style={styles.top}>
          <TouchableOpacity onPress={goBack} style={styles.button}>
            <Image style={styles.back} source={require("../assets/back.png")} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.original}>
        <Thought
          name={route.params.name}
          time={route.params.time}
          collabs={route.params.collabs}
          reactions={route.params.reactions}
          thought={route.params.thought}
        />
      </View>
      <View style={styles.reactions}>
        <ReactionSection uid={route.params.id} />
      </View>
      {/* TODO: The think backdrop has a sliver of a white border on the very top */}
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
            onPress={onPressSheet}
            swiped={!swiped}
          />
        )} // WHYYY? TODO @RAPH
      ></BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray_1,
    alignItems: "center",
    marginTop: 24,
    alignSelf: "center",
    width: "100%",
  },
  header: {
    alignItems: "center",
    marginTop: 4,
    width: "90%",
    marginBottom: 24,
  },
  original: {
    width: "90%",
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    // backgroundColor: "pink",
    width: "100%",
    position: "absolute",
  },
  title: {
    color: colors.primary_5,
    fontFamily: "Nunito-Bold",
    fontSize: 24,
    justifyContent: "center",
  },
  button: {
    paddingRight: 16,
    paddingBottom: 16,
  },
  back: {
    width: 10.85,
    height: 18.95,
    alignSelf: "center",
    // TODO: Arbitrary numbers????
    marginLeft: 4,
    marginTop: 6,
  },
  reactions: {
    flex: 1,
    width: "90%",
    // Needed so that you can see the last element - a hacky solution
    marginBottom: 32,
  },
  sheet: {
    backgroundColor: colors.almost_white,
    shadowColor: colors.gray_5,
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

export default ReactionsScreen;
