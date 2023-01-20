import { StyleSheet, FlatList, SectionList, Text } from "react-native";
import React, { useState, useEffect } from "react";
import OutsideUserElement from "./OutsideUserElement";
import { getUsernamesStartingWith } from "../api";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";
import colors from "../assets/colors";

const OutsideUsersDisplay = ({ friends, text }) => {
  const [user, setUser] = useRecoilState(userState);
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({
    width: 0,
    height: 0,
  });

  const getOutsidersInfo = (text) => {
    getUsernamesStartingWith(text, 10).then((usernames) => {
      usernames.forEach((otherUser) => {
        const found = data.some(
          (other) => other.name === otherUser.data().name
        );
        const foundFriend = friends.some((friend) => friend === otherUser.id);
        if (!found && !foundFriend && otherUser.id != user.uid) {
          console.log("outsidersINfo", user);
          setData((data) => [
            ...data,
            {
              uid: otherUser.id,
              name: otherUser.data().name,
              username: otherUser.data().username,
            },
          ]);
        }
      });
    });
  };

  useEffect(() => {
    getOutsidersInfo(text);
  }, [text]);

  const addUserAsFriend = (uid) => {};

  return (
    <>
      {data.length > 0 ? <Text style={styles.header}>Other</Text> : null}
      <FlatList
        onLayout={(event) => setLayout(event.nativeEvent.layout)}
        data={data}
        renderItem={({ item }) => (
          <OutsideUserElement
            name={item.name}
            username={item.username}
            uid={item.uid}
            //   remove={removeFriendInstances}
            layout={layout}
          />
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

export default OutsideUsersDisplay;
