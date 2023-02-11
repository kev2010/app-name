import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Keyboard,
  Pressable,
  Image,
} from "react-native";
import React, { useState, useMemo, useRef, useEffect } from "react";
import colors from "../assets/colors";
import Handle from "../components/Handle";
import Think from "../components/Think";
import FriendsIcon from "../components/FriendsIcon";
import BottomSheet from "@gorhom/bottom-sheet";
import Feed from "../components/Feed";
import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useRecoilState } from "recoil";
import { getUser, updateNotificationToken } from "../api";
import { userState } from "../globalState";
import {
  registerForPushNotificationsAsync,
  sendPushNotification,
} from "../notifications";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const HomeScreen = ({ navigation }) => {
  // TODO: Make keyboard go away when you switch between screens - for some reason it defaults to being active
  // TODO: Make BottomSheet a separate component to unclutter

  const [globalFeed, setGlobal] = useState(false);
  const [friendsFeed, setFriends] = useState(true);
  const globalStyle = useGlobalStyle(globalFeed);
  const friendsStyle = useFriendsStyle(friendsFeed);
  const [swiped, setSwipe] = useState(false);
  const [user, setUser] = useRecoilState(userState);
  const [requestsNotification, setRequestsNotification] = useState(false);
  const [imageURL, setImageURL] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  const getFriendsData = () => {
    // Can't set recoil state user with list of firebase userrefs (throws "FIRESTORE (9.15.0) INTERNAL ASSERTION FAILED: Unexpected state" & others)
    // Temporary workaround/fix is to store the document IDs (the UID of friends) instead of the firebase userRef
    getUser(user.uid).then((currentUser) => {
      // TODO: Could set this as a regular JSON instead of just the ID to do one less firebase read
      const userFriends =
        currentUser.data().friends != null
          ? currentUser.data().friends.map((userRef) => {
              return userRef.id;
            })
          : [];
      const userRequests =
        currentUser.data().friendRequests != null
          ? currentUser.data().friendRequests.map((userRef) => {
              return userRef.id;
            })
          : [];
      const userSent =
        currentUser.data().sentRequests != null
          ? currentUser.data().sentRequests.map((userRef) => {
              return userRef.id;
            })
          : [];

      setUser((user) => ({
        ...user,
        friends: userFriends,
        friendRequests: userRequests,
        sentRequests: userSent,
      }));
      setRequestsNotification(userRequests.length > 0);
    });
  };

  const registerNotification = () => {
    if (
      user.notificationToken === undefined ||
      user.notificationToken === null ||
      user.notification === ""
    ) {
      registerForPushNotificationsAsync().then((token) => {
        setUser((user) => ({
          ...user,
          notificationToken: token,
        }));
        console.log("TOKEN", token, user);
        updateNotificationToken(user.uid, token).then();
      });
    }
  };

  useEffect(() => {
    Keyboard.dismiss();
    const unsubscribe = navigation.addListener("focus", () => {
      // The screen is focused
      // Call any action and update data
      if (user.imageURL != null) {
        setImageURL(user.imageURL);
      }
      getFriendsData();
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    registerNotification();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

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

  const shuffleFeed = () => {};

  const goToSettingsScreen = () => {
    navigation.navigate("Settings");
  };

  const goToFriendsScreen = () => {
    getFriendsData();
    navigation.navigate("Friends");
  };

  // ref
  const bottomSheetRef = useRef(null);

  // variables
  const snapPoints = useMemo(() => ["11%", "85%"], []);

  const renderBackdrop = (props) => {
    return (
      <BottomSheetBackdrop {...props} pressBehavior={"collapse"} opacity={0}>
        <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }} />
      </BottomSheetBackdrop>
    );
  };

  const onPressSheet = () => {
    bottomSheetRef.current.snapToIndex(!swiped ? 0 : 1);
  };

  const submitted = () => {
    bottomSheetRef.current.snapToIndex(0);
    setSwipe(false);
  };

  const handleBottomSheetSwipe = () => {
    Keyboard.dismiss;
    setSwipe(!swiped);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <StatusBar barStyle={"light-content"} />
        <Text style={styles.title}>App Name</Text>
        <View style={styles.top}>
          <TouchableOpacity onPress={goToSettingsScreen}>
            <Image
              style={styles.profile}
              source={
                imageURL != ""
                  ? { uri: imageURL }
                  : require("../assets/default.jpeg")
              }
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={goToFriendsScreen}>
            <FriendsIcon hasNotification={requestsNotification} />
          </TouchableOpacity>
        </View>
        <View style={styles.feed}>
          <TouchableOpacity onPress={onPressGlobal}>
            <Text style={[styles.type, globalStyle]}>Global</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onPressFriends}>
            <Text style={[styles.type, friendsStyle]}>Friends</Text>
          </TouchableOpacity>
        </View>
        {/* <View style={styles.shuffle}>
          <TouchableOpacity onPress={shuffleFeed}>
            <Image
              style={styles.shuffleButton}
              source={require("../assets/shuffle.png")}
            />
          </TouchableOpacity>
        </View> */}
      </View>
      <View
        style={[
          styles.empty,
          {
            opacity: globalFeed && swiped ? 1 : 0,
          },
        ]}
      >
        <Text style={styles.thought}>🚧</Text>
        <Text style={styles.subtitle}>Coming later...</Text>
      </View>
      <View
        style={[
          styles.displayFeed,
          {
            opacity: globalFeed ? 0 : 1,
          },
        ]}
        pointerEvents={globalFeed ? "none" : "auto"}
      >
        <Feed navigation={navigation} uid={user.uid}></Feed>
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        onChange={handleBottomSheetSwipe}
        backgroundStyle={styles.sheet}
        backdropComponent={renderBackdrop}
        enabledContentTapInteraction={true}
        style={styles.sheet}
        handleComponent={() => (
          <Handle onPress={onPressSheet} swiped={!swiped} />
        )}
      >
        <Think swiped={!swiped} submitted={submitted}></Think>
      </BottomSheet>
    </SafeAreaView>
  );
};

const useGlobalStyle = (globalFeed) => {
  return {
    color: globalFeed ? colors.primary_5 : colors.gray_3,
    fontFamily: globalFeed ? "Nunito-Bold" : "Nunito-Regular",
  };
};

const useFriendsStyle = (friendsFeed) => {
  return {
    color: friendsFeed ? colors.primary_5 : colors.gray_3,
    fontFamily: friendsFeed ? "Nunito-Bold" : "Nunito-Regular",
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray_1,
    alignItems: "center",
    marginTop: 24,
  },
  header: {
    alignItems: "center",
    marginTop: 4,
    width: "90%",
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    position: "absolute",
  },
  shuffle: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
    position: "absolute",
    marginTop: 16,
  },
  shuffleButton: {
    width: 18,
    height: 15,
    alignSelf: "center",
  },
  title: {
    color: colors.primary_5,
    fontFamily: "Nunito-Bold",
    fontSize: 24,
    justifyContent: "center",
  },
  profile: {
    width: 24,
    height: 24,
    borderRadius: 100,
    alignSelf: "center",
  },
  displayFeed: {
    flex: 1,
    width: "94%",
    // Needed so that you can see the last element - a hacky solution
    marginBottom: 48,
    borderRadius: 15,
    overflow: "hidden",
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
    paddingRight: 20,
    width: "100%",
    height: 10,
  },
  backdrop: {
    // marginTop: 0,
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
  empty: {
    position: "absolute",
    marginTop: 24,
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    zIndex: 1,
    top: "25%",
  },
  thought: {
    fontSize: 48,
  },
  subtitle: {
    color: colors.gray_5,
    fontFamily: "Nunito-SemiBold",
    fontSize: 20,
  },
});

export default HomeScreen;
