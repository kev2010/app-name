import { StyleSheet, FlatList, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import FriendElement from "./FriendElement";
import { getUser, removeFriend, getProfilePicture } from "../api";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";
import colors from "../assets/colors";

const FriendsDisplay = ({ friends, filter }) => {
  const [user, setUser] = useRecoilState(userState);
  const [data, setData] = useState([]);
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
                name: user.data().name,
                username: user.data().username,
              },
            ]);
          }
        });
      });
    });
  };

  useEffect(() => {
    getFriendsInfo(friends);
  }, []);

  const removeFriendInstances = (uid) => {
    // Have to Firebase list AND delete display friends list AND global user state's friends list
    // Not sure if this is the best logic to handle it (I tried with Recoil selectors, but the async "getUser" calls are messy)
    removeFriend(user.uid, uid).then(() => {
      setUser((user) => ({
        ...user,
        friends: user.friends.filter((id) => id !== uid),
      }));
      setData(data.filter((item) => item.uid !== uid));
    });
  };

  return (
    <>
      {data.filter(
        (item) =>
          item.name.toLowerCase().includes(filter) ||
          item.username.includes(filter)
      ).length > 0 ? (
        <Text style={styles.header}>My Friends ({data.length})</Text>
      ) : null}
      <FlatList
        keyboardShouldPersistTaps={"always"}
        showsVerticalScrollIndicator={false}
        onLayout={(event) => setLayout(event.nativeEvent.layout)}
        data={data
          .filter(
            (item) =>
              item.name.toLowerCase().includes(filter) ||
              item.username.includes(filter)
          )
          .sort((a, b) => a.name.localeCompare(b.name))}
        renderItem={({ item }) => (
          <View onStartShouldSetResponder={() => true}>
            <FriendElement
              name={item.name}
              username={item.username}
              imageURL={item.imageURL}
              uid={item.uid}
              remove={removeFriendInstances}
              layout={layout}
            />
          </View>
        )}
        keyExtractor={(item) => item.uid}
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    color: colors.gray_3,
    fontFamily: "Nunito-SemiBold",
    fontSize: 16,
    marginBottom: 16,
  },
});

export default FriendsDisplay;
