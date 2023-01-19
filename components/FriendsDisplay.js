import { StyleSheet, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import FriendElement from "../components/FriendElement";
import { getUser, removeFriend } from "../api";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";

const FriendsDisplay = ({ friends }) => {
  const [user, setUser] = useRecoilState(userState);
  const [data, setData] = useState([]);

  const getFriendsInfo = (friends) => {
    // TODO: Decide whether we should be doing this logic (converting array of userRefs to array of user objects) in the home screen or here)
    friends.forEach((uid) => {
      getUser(uid).then((user) => {
        const found = data.some((friend) => friend.name === user.data().name);
        if (!found) {
          // IMPORTANT: Need to use a function to create a new array since state updates are asynchronous or sometimes batched.
          // This also assumes that the document ID (the user document) is the user's UID
          setData((data) => [
            ...data,
            {
              uid: uid,
              name: user.data().name,
              username: user.data().username,
            },
          ]);
        }
      });
    });
  };

  useEffect(() => {
    getFriendsInfo(friends);
  }, []);

  const removeFriendInstances = (uid) => {
    // Have to Firebase list AND delete display friends list AND global user state's friends list
    // TODO: Not sure if this is the best logic to handle it (I tried with Recoil selectors, but the async "getUser" calls are messy)
    removeFriend(user.uid, uid).then(() => {
      setUser((user) => ({
        ...user,
        friends: user.friends.filter((id) => id !== uid),
      }));
      setData(data.filter((item) => item.uid !== uid));
    });
  };

  return (
    <FlatList
      contentContainerStyle={styles.display}
      data={data}
      renderItem={({ item }) => (
        <FriendElement
          name={item.name}
          username={item.username}
          uid={item.uid}
          remove={removeFriendInstances}
        />
      )}
      keyExtractor={(item) => item.uid}
    />
  );
};

const styles = StyleSheet.create({
  display: {
    alignItems: "center",
    backgroundColor: "purple",
    // width: "100%",
  },
});

export default FriendsDisplay;
