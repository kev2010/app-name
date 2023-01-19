import { StyleSheet, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import FriendElement from "../components/FriendElement";
import { getDocument } from "../api";

const FriendsDisplay = ({ friends }) => {
  const [data, setData] = useState([]);
  console.log("gotta display");

  const getFriendsInfo = (friends) => {
    console.log("getting frineds ingo!!!", friends);
    friends.forEach((userRef) => {
      getDocument(userRef).then((user) => {
        const found = data.some((friend) => friend.name === user.data().name);
        if (!found) {
          console.log("adding", user.data().name, "to", data);
          // IMPORTANT: Need to use a function to create a new array since state updates are asynchronous or sometimes batched.
          setData((data) => [
            ...data,
            {
              key: user.data().username,
              name: user.data().name,
              username: user.data().username,
            },
          ]);
          console.log("just set", data);
        }
      });
    });
  };

  useEffect(() => {
    getFriendsInfo(friends);
  }, []);

  return (
    <FlatList
      contentContainerStyle={styles.display}
      data={data}
      renderItem={({ item }) => (
        <FriendElement name={item.name} username={item.username} />
      )}
      keyExtractor={(item) => item.key}
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
