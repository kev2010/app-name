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
import { getUser } from "../api";
import { userState } from "../globalState";

const HomeScreen = ({ navigation }) => {
  // const [refreshing, setRefreshing] = React.useState(false);

  // TODO: Allow refresh of feed
  // const onRefresh = () => {
  //   setRefreshing(true);
  //   setItems([...Items, { key: 69, item: "item 69" }]);
  //   setRefreshing(false);
  // };
  // TODO: Empty state of feed
  // TODO: Make keyboard go away when you switch between screens - for some reason it defaults to being active

  const [globalFeed, setGlobal] = useState(false);
  const [friendsFeed, setFriends] = useState(true);
  const globalStyle = useGlobalStyle(globalFeed);
  const friendsStyle = useFriendsStyle(friendsFeed);
  const [swiped, setSwipe] = useState(false);
  const [user, setUser] = useRecoilState(userState);

  const getFriendsData = () => {
    // TODO: Figure out why the heck I can't set recoil state user with list of firebase userrefs (throws "FIRESTORE (9.15.0) INTERNAL ASSERTION FAILED: Unexpected state" & others)
    // Temporary workaround/fix is to store the document IDs (the UID of friends) instead of the firebase userRef
    getUser(user.uid).then((currentUser) => {
      const userFriends = currentUser.data().friends.map((userRef) => {
        return userRef.id;
      });
      const userRequests = currentUser.data().friendRequests.map((userRef) => {
        return userRef.id;
      });
      const userSent = currentUser.data().sentRequests.map((userRef) => {
        return userRef.id;
      });

      setUser((user) => ({
        ...user,
        friends: userFriends,
        friendRequests: userRequests,
        sentRequests: userSent,
      }));
    });
  };

  useEffect(() => {
    getFriendsData();
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

  const goToProfileScreen = () => {
    navigation.navigate("Profile");
  };

  const goToFriendsScreen = () => {
    getFriendsData();
    navigation.navigate("Friends");
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
    bottomSheetRef.current.snapToIndex(!swiped ? 0 : 1);
    console.log("hello", swiped);
  };

  const submitted = () => {
    bottomSheetRef.current.snapToIndex(0);
    setSwipe(false);
  };

  const handleBottomSheetSwipe = () => {
    Keyboard.dismiss;
    setSwipe(!swiped);
    console.log("logs", swiped);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <StatusBar barStyle={"light-content"} />
        <Text style={styles.title}>App Name</Text>
        <View style={styles.top}>
          <TouchableOpacity onPress={goToProfileScreen}>
            <Image
              style={styles.profile}
              source={require("../assets/fbprofile.jpg")}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={goToFriendsScreen}>
            <FriendsIcon hasNotification={user.friendRequests.length > 0} />
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
      </View>
      <View style={styles.displayFeed}>
        <Feed uid={user.uid}></Feed>
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
        <Think swiped={!swiped} submitted={submitted}></Think>
      </BottomSheet>
    </SafeAreaView>
  );
};

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
  profile: {
    width: 24,
    height: 24,
    borderRadius: 100,
    alignSelf: "center",
  },
  displayFeed: {
    width: "95%",
    // alignItems: "center",
    height: "100%",
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
  },
});

export default HomeScreen;
