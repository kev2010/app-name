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
  ScrollView,
} from "react-native";
import Handle from "./Handle";
import React, { useState, useRef, useMemo, useEffect } from "react";
import colors from "../assets/colors";
import Thought from "../components/Thought";
import ReactionSection from "./ReactionSection";
import GiveComment from "./GiveComment";
import BottomSheet from "@gorhom/bottom-sheet";
import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { getUser, getProfilePicture, getReactions, getEmojis } from "../api";
import { calculateTimeDiffFromNow } from "../helpers";

const ReactionsScreen = ({ navigation, route }) => {
  const [swiped, setSwipe] = useState(false);
  const [data, setData] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [emojiCount, setEmojiCount] = useState(route.params.emojis);
  const [loading, setLoading] = useState(false);
  // TODO: Unclutter like in HomeScreen by moving bottom sheet to a separate component
  const goBack = () => {
    navigation.goBack();
  };

  // TODO: This is an extremely hacky solution. For some reason, the Bottom Sheet component I used online (screw outside components holy crap) calls onChange on render, which is why we have to pass in !swiped instead of swiped. E.g. if we pass "swiped" (initialized to false) to the components, then, ON RENDER, onChange is fired, which calls "handleBottomSheetSwipe" immediately, which then changed swiped to true. This means that the page effectively loads with swiped=true so the keyboard pops up.
  // But the problem with just passing !swiped is that the keyboard is initially set to true (because !swiped = true is being passed in to GiveComment), so the keyboard initially pops up before the render onChange is fired and !swiped becomes false, so the keyboard goes back down. My temporary hack to fix this keyboard popping up in the beginning is to just add a "loading" thing for 450ms that hides everything (giving swiped a chance to change around)before showing everything. Should definitely fix in the future!
  useEffect(() => {
    setLoading(true);
    refreshReactions();
    setTimeout(() => {
      setInitialLoading(false);
    }, 450);
  }, []);

  useEffect(() => {
    refreshEmojis();
  }, []);

  const refreshReactions = () => {
    let itemsProcessed = 0;
    getReactions(route.params.id).then((reactions) => {
      if (reactions.size > 0) {
        reactions.forEach((reactionDoc) => {
          getUser(reactionDoc.data().name.id).then((user) => {
            getProfilePicture(reactionDoc.data().name.id).then((imageURL) => {
              const found = data.some(
                (reaction) => reaction.id === reactionDoc.id
              );
              if (!found) {
                // IMPORTANT: Need to use a function to create a new array since state updates are asynchronous or sometimes batched.
                setData((data) => [
                  {
                    id: reactionDoc.id,
                    creatorID: user.id,
                    imageURL: imageURL,
                    name: user.data().username,
                    text: reactionDoc.data().text,
                    time: calculateTimeDiffFromNow(
                      reactionDoc.data().time.toDate()
                    ),
                    rawTime: reactionDoc.data().time,
                  },
                  ...data,
                ]);
                itemsProcessed++;
                if (itemsProcessed === reactions.size) {
                  setLoading(false);
                }
              } else {
                itemsProcessed++;
                if (itemsProcessed === reactions.size) {
                  setLoading(false);
                }
              }
            });
          });
        });
      } else {
        setLoading(false);
      }
    });
  };

  const refreshEmojis = () => {
    getEmojis(route.params.id).then((result) => {
      setEmojiCount(result.size);
    });
  };

  // ref
  const bottomSheetRef = useRef(null);

  // variables
  const snapPoints = useMemo(() => ["11%", "85%"], []);

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
        {/* <StatusBar barStyle={"light-content"} /> */}
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
        <ScrollView style={styles.original}>
          <Thought
            navigation={navigation}
            creatorID={route.params.creatorID}
            imageURL={route.params.imageURL}
            profileURL={route.params.profileURL}
            name={route.params.name}
            time={route.params.time}
            collabs={route.params.collabs}
            emojis={emojiCount}
            reactions={route.params.reactions}
            thoughtUID={route.params.id}
            thought={route.params.thought}
            showTrash={true}
            locked={false}
          />
          <View style={styles.reactions}>
            {loading ? (
              <ActivityIndicator
                style={{ marginTop: 24 }}
                size="large"
                color={colors.primary_5}
              />
            ) : (
              <ReactionSection
                navigation={navigation}
                data={data.sort(function (x, y) {
                  return x.rawTime - y.rawTime;
                })}
                uid={route.params.id}
              />
            )}
          </View>
        </ScrollView>
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          onChange={handleBottomSheetSwipe}
          backgroundStyle={styles.sheet}
          backdropComponent={renderBackdrop}
          enabledContentTapInteraction={true}
          style={styles.sheet}
          handleComponent={({ animatedIndex, animatedPosition }) => (
            <Handle onPress={onPressSheet} swiped={!swiped} />
          )}
        >
          <GiveComment
            thoughtUID={route.params.id}
            creatorID={route.params.creatorID}
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
    paddingTop: 24,
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
    width: "94%",
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
    marginTop: 4,
    // Needed so that you can see the last element - a hacky solution
    marginBottom: 12,
    paddingBottom: 64,
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
