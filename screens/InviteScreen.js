import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";
import InviteElement from "../components/InviteElement";
import colors from "../assets/colors";
import { useRecoilState } from "recoil";
import { userState, invitedState } from "../globalState";
import { getUser, getProfilePicture } from "../api";

const InviteScreen = ({ navigation }) => {
  const [user, setUser] = useRecoilState(userState);
  const [data, setData] = useState([]);
  const [invited, setInvited] = useRecoilState(invitedState);
  const [layout, setLayout] = useState({
    width: 0,
    height: 0,
  });

  const getFriendsInfo = (friends) => {
    // TODO: Decide whether we should be doing this logic (converting array of userRefs to array of user objects) in the home screen, friends screen, or here)
    friends.forEach((uid) => {
      getUser(uid).then((user) => {
        getProfilePicture(uid).then((imageURL) => {
          const found = data.some((friend) => friend.uid === uid);
          if (!found) {
            // IMPORTANT: Need to use a function to create a new array since state updates are asynchronous or sometimes batched.
            // This also assumes that the document ID (the user document) is the user's UID
            setData((data) => [
              ...data,
              {
                uid: uid,
                imageURL: imageURL,
                notificationToken: user.data().notificationToken,
                name: user.data().name,
                username: user.data().username,
                // check if the friend uid is in the previous selected friends list of objects
                selected: invited.some((friend) => friend.uid === uid),
              },
            ]);
          }
        });
      });
    });
  };

  useEffect(() => {
    getFriendsInfo(user.friends);
  }, []);

  const toggleFriendSelection = (friendId) => {
    // toggle the selected state of the friend
    const newFriends = data.map((friend) => {
      if (friend.uid === friendId) {
        friend.selected = !friend.selected;
      }
      return friend;
    });
    setData(newFriends);
  };

  const handleBackPress = () => {
    setInvited(data.filter((friend) => friend.selected));
    // Return the selected user IDs
    navigation.goBack();
  };

  const renderItem = ({ item, index }) => (
    <InviteElement
      last={index === data.length - 1}
      user={item}
      isSelected={item.selected}
      onSelect={() => {
        toggleFriendSelection(item.uid);
      }}
      layout={layout}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {data.filter((friend) => friend.selected).length} Selected
        </Text>
        <View style={styles.top}>
          <TouchableOpacity onPress={handleBackPress} style={styles.button}>
            <Image style={styles.back} source={require("../assets/back.png")} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.list}>
        <FlatList
          showsVerticalScrollIndicator={false}
          onLayout={(event) => setLayout(event.nativeEvent.layout)}
          data={data.sort((a, b) => a.username.localeCompare(b.username))}
          renderItem={renderItem}
          keyExtractor={(item) => item.uid}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
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
  list: {
    width: "85%",
    marginTop: 24,
  },
});

export default InviteScreen;
