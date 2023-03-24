import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  StyleSheet,
  Modal,
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight,
  Keyboard,
  Image,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import colors from "../assets/colors";
import FaceReaction from "../components/FaceReaction";
import FriendsIcon from "../components/FriendsIcon";
import ChatIcon from "../components/ChatIcon";
import Feed from "../components/Feed";
import { useRecoilState } from "recoil";
import {
  getUser,
  updateNotificationToken,
  updateUserPhoneNumber,
} from "../api";
import { userState, refreshingState, feedDataState } from "../globalState";
import { refreshFeed } from "../logic";
import {
  registerForPushNotificationsAsync,
  sendPushNotification,
} from "../notifications";
import * as Notifications from "expo-notifications";
import { CONSTANTS } from "../constants";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { changePhotoURLThoughts } from "../api";

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// });

const HomeScreen = ({ navigation }) => {
  // TODO: Make keyboard go away when you switch between screens - for some reason it defaults to being active
  // TODO: Make BottomSheet a separate component to unclutter

  const [globalFeed, setGlobal] = useState(false);
  const [friendsFeed, setFriends] = useState(true);
  const globalStyle = useGlobalStyle(globalFeed);
  const friendsStyle = useFriendsStyle(friendsFeed);
  const [user, setUser] = useRecoilState(userState);
  const [feedData, setFeedData] = useRecoilState(feedDataState);
  const [refreshing, setRefreshing] = useRecoilState(refreshingState);
  const [openCamera, setOpenCamera] = useState(false);
  const [cameraThought, setCameraThought] = useState("");
  const [requestsNotification, setRequestsNotification] = useState(false);
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

  const onPressModalBackground = () => {
    setOpenCamera(false);
    setCameraThought("");
  };

  const getNotificationToken = async () => {
    return await getUser(user.uid).then(
      (currentUser) => currentUser.data().notificationToken
    );
  };

  const registerNotification = () => {
    getNotificationToken().then((token) => {
      if (token === undefined || token === "") {
        registerForPushNotificationsAsync().then((token) => {
          setUser((user) => ({
            ...user,
            notificationToken: token,
          }));
          updateNotificationToken(user.uid, token).then();
        });
      }
    });
  };

  const getPhoneNumber = async () => {
    return await getUser(user.uid).then(
      (currentUser) => currentUser.data().phoneNumber
    );
  };

  const getProfilePicture = async () => {
    return await getUser(user.uid).then(
      (currentUser) => currentUser.data().photoURL
    );
  };

  useEffect(() => {
    getProfilePicture().then((url) => {
      if (url != user.imageURL) {
        changePhotoURLThoughts(user.uid, user.imageURL);
      }
    });
  });

  useEffect(() => {
    Keyboard.dismiss();
    const unsubscribe = navigation.addListener("focus", () => {
      // The screen is focused
      // Call any action and update data
      getFriendsData();
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return () => {
      unsubscribe();
    };
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

  useEffect(() => {
    getPhoneNumber().then((number) => {
      if (number === undefined) {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
          if (user) {
            updateUserPhoneNumber(user.uid, user.phoneNumber);
          }
        });
      }
    });
  }, []);

  const onPressGlobal = () => {
    if (!globalFeed) {
      setGlobal(true);
      setFriends(false);

      setRefreshing(true);
      refreshFeed(user.uid, true).then((data) => {
        setFeedData(data);
        setRefreshing(false);
      });
    }
  };

  const onPressFriends = () => {
    if (!friendsFeed) {
      setGlobal(false);
      setFriends(true);

      setRefreshing(true);
      refreshFeed(user.uid, false).then((data) => {
        setFeedData(data);
        setRefreshing(false);
      });
    }
  };

  const goToSettingsScreen = () => {
    navigation.navigate("Settings");
  };

  const goToFriendsScreen = () => {
    getFriendsData();
    navigation.navigate("Friends");
  };

  const goToChatsScreen = () => {
    navigation.navigate("Chats");
  };

  const goToThinkScreen = () => {
    navigation.navigate("Think");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal visible={openCamera} transparent={true} animationType="slide">
        <TouchableHighlight
          style={styles.modalBackground}
          onPress={onPressModalBackground}
          underlayColor={"rgba(0, 0, 0, 0.5)"}
        >
          <FaceReaction
            thoughtUID={cameraThought}
            goBack={onPressModalBackground}
          />
        </TouchableHighlight>
      </Modal>
      <View style={styles.header}>
        <StatusBar barStyle={"light-content"} />
        <Text style={styles.title}>{CONSTANTS.APP_NAME}</Text>
        <View style={styles.top}>
          <TouchableOpacity onPress={goToSettingsScreen}>
            <Image
              style={styles.profile}
              source={
                user.imageURL != ""
                  ? { uri: user.imageURL }
                  : require("../assets/default.jpeg")
              }
            />
          </TouchableOpacity>
          <View style={styles.rhs}>
            <TouchableOpacity onPress={goToFriendsScreen}>
              <FriendsIcon hasNotification={requestsNotification} />
            </TouchableOpacity>
            <TouchableOpacity onPress={goToChatsScreen}>
              <ChatIcon hasNotification={false} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.feed}>
          <TouchableOpacity onPress={onPressGlobal}>
            <Text style={[styles.type, globalStyle]}>Discover</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onPressFriends}>
            <Text style={[styles.type, friendsStyle]}>Friends</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.displayFeed}>
        <Feed
          navigation={navigation}
          uid={user.uid}
          setOpenCamera={setOpenCamera}
          setCameraThought={setCameraThought}
          discover={globalFeed}
        ></Feed>
      </View>

      <View style={styles.addPositionView}>
        <TouchableOpacity style={styles.addPosition} onPress={goToThinkScreen}>
          <View style={styles.addThoughtButton}>
            <Image
              style={styles.addThoughtPlus}
              source={require("../assets/plusWhite.png")}
            />
          </View>
        </TouchableOpacity>
      </View>
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
    paddingTop: 24,
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
  rhs: {
    flexDirection: "row",
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
    // marginBottom: 48,
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
  addPositionView: {
    position: "absolute",
    bottom: 64,
    right: 16,
  },
  addPosition: {
    padding: 12,
    marginRight: -12,
    marginBottom: -12,
    // backgroundColor: "purple",
  },
  addThoughtButton: {
    backgroundColor: colors.primary_5,
    width: 48,
    height: 48,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  addThoughtPlus: {
    width: 16,
    height: 16,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;
