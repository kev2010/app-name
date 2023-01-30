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
  ActivityIndicator,
} from "react-native";
import Handle from "../components/Handle";
import React, { useState, useRef, useMemo, useEffect } from "react";
import colors from "../assets/colors";
import Thought from "../components/Thought";
import ReactionSection from "../components/ReactionSection";
import GiveComment from "../components/GiveComment";
import BottomSheet from "@gorhom/bottom-sheet";
import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { getUser, getReactions } from "../api";
import { calculateTimeDiffFromNow } from "../helpers";

const ReactionsScreen = ({ navigation, route }) => {
  const [swiped, setSwipe] = useState(false);
  const [data, setData] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  // TODO: Unclutter like in HomeScreen by moving bottom sheet to a separate component
  const goBack = () => {
    navigation.goBack();
  };

  // TODO: This is an extremely hacky solution. For some reason, the Bottom Sheet component I used online (screw outside components holy crap) calls onChange on render, which is why we have to pass in !swiped instead of swiped. E.g. if we pass "swiped" (initialized to false) to the components, then, ON RENDER, onChange is fired, which calls "handleBottomSheetSwipe" immediately, which then changed swiped to true. This means that the page effectively loads with swiped=true so the keyboard pops up.
  // But the problem with just passing !swiped is that the keyboard is initially set to true (because !swiped = true is being passed in to GiveComment), so the keyboard initially pops up before the render onChange is fired and !swiped becomes false, so the keyboard goes back down. My temporary hack to fix this keyboard popping up in the beginning is to just add a "loading" thing for 450ms that hides everything (giving swiped a chance to change around)before showing everything. Should definitely fix in the future!
  useEffect(() => {
    refreshReactions();
    setTimeout(() => {
      setInitialLoading(false);
    }, 450);
  }, []);

  const refreshReactions = () => {
    getReactions(route.params.id).then((reactions) => {
      reactions.forEach((reactionDoc) => {
        getUser(reactionDoc.data().name.id).then((user) => {
          const found = data.some((reaction) => reaction.id === reactionDoc.id);
          if (!found) {
            // IMPORTANT: Need to use a function to create a new array since state updates are asynchronous or sometimes batched.
            setData((data) => [
              ...data,
              {
                id: reactionDoc.id,
                creatorID: user.id,
                name: user.data().name,
                text: reactionDoc.data().text,
                time: calculateTimeDiffFromNow(
                  reactionDoc.data().time.toDate()
                ),
              },
            ]);
          }
        });
      });
    });
  };

  // ref
  const bottomSheetRef = useRef(null);

  // variables
  const snapPoints = useMemo(() => ["10.5%", "85%"], []);

  const submitted = () => {
    refreshReactions();
    bottomSheetRef.current.snapToIndex(0);
    setSwipe(false);
  };

  const renderBackdrop = (props) => {
    return (
      <BottomSheetBackdrop {...props} pressBehavior={"collapse"} opacity={0}>
        <Pressable {...props} onPress={Keyboard.dismiss} style={{ flex: 1 }} />
      </BottomSheetBackdrop>
    );
  };

  const handleBottomSheetSwipe = () => {
    Keyboard.dismiss;
    setSwipe(!swiped);
  };

  const onPressSheet = () => {
    bottomSheetRef.current.snapToIndex(!swiped ? 0 : 1);
  };

  return (
    <>
      <ActivityIndicator
        size="large"
        color={colors.primary_3}
        style={[
          styles.loading,
          {
            opacity: initialLoading ? 1 : 0,
          },
        ]}
      />
      <SafeAreaView
        style={[
          styles.container,
          {
            opacity: initialLoading ? 0 : 1,
          },
        ]}
      >
        <StatusBar barStyle={"light-content"} />
        <View style={styles.header}>
          <Text style={styles.title}>Thought</Text>
          <View style={styles.top}>
            <TouchableOpacity onPress={goBack} style={styles.button}>
              <Image
                style={styles.back}
                source={require("../assets/back.png")}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.original}>
          <Thought
            navigation={navigation}
            creatorID={route.params.creatorID}
            name={route.params.name}
            time={route.params.time}
            collabs={route.params.collabs}
            reactions={route.params.reactions}
            thought={route.params.thought}
          />
        </View>
        <View style={styles.reactions}>
          <ReactionSection
            navigation={navigation}
            data={data}
            uid={route.params.id}
          />
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
        >
          <GiveComment
            thoughtUID={route.params.id}
            swiped={!swiped}
            submitted={submitted}
            initialLoading={initialLoading}
          />
        </BottomSheet>
      </SafeAreaView>
    </>
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
  loading: {
    position: "absolute",
    top: "50%",
    alignSelf: "center",
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
    marginTop: 12,
    // Needed so that you can see the last element - a hacky solution
    marginBottom: 32,
    borderRadius: 15,
    overflow: "hidden",
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
    borderRadius: 15,
  },
});

export default ReactionsScreen;
