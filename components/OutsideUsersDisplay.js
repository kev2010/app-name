import { StyleSheet, FlatList, View, Text } from "react-native";
import React, { useState, useEffect } from "react";
import OutsideUserElement from "./OutsideUserElement";
import {
  getUsernamesStartingWith,
  getProfilePicture,
  sendFriendRequest,
} from "../api";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";
import colors from "../assets/colors";

// TODO: UX where your current friend requests DON'T show up in "OutsideUsersDisplay" not exactly intuitive, but easy to implement code wise lol. Eventually, should show friend requests in a seperate table in same screen.
const OutsideUsersDisplay = ({ friends, friendRequests, sent, text }) => {
  const [user, setUser] = useRecoilState(userState);
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({
    width: 0,
    height: 0,
  });

  const getOutsidersInfo = (text) => {
    getUsernamesStartingWith(text, 10).then((usernames) => {
      usernames.forEach((otherUser) => {
        getProfilePicture(otherUser.id).then((imageURL) => {
          const foundFriend = friends.some((friend) => friend === otherUser.id);
          const foundRequest = friendRequests.some(
            (request) => request === otherUser.id
          );
          if (!foundFriend && !foundRequest && otherUser.id != user.uid) {
            setData((data) =>
              [
                ...data,
                {
                  uid: otherUser.id,
                  imageURL: imageURL,
                  name: otherUser.data().name,
                  username: otherUser.data().username,
                },
              ].reduce((unique, o) => {
                if (!unique.some((obj) => obj.uid === o.uid)) {
                  unique.push(o);
                }
                return unique;
              }, [])
            );
          }
        });
      });
    });
  };

  useEffect(() => {
    getOutsidersInfo(text);
  }, [text]);

  const addUserAsFriend = (friendUID) => {
    return new Promise((resolve, reject) => {
      // Push friend request to everywhere only if it doesn't exist yet
      if (user.friendRequests.indexOf(friendUID) === -1) {
        sendFriendRequest(user.uid, friendUID).then(() => {
          // Update global user state to show that user sent a friend request
          setUser((user) => ({
            ...user,
            sentRequests: [...new Set([...user.sentRequests, friendUID])],
          }));
          resolve(true);
        });
      }
    });
  };

  return (
    <>
      {data.length > 0 ? <Text style={styles.header}>Other</Text> : null}
      <FlatList
        keyboardShouldPersistTaps={"always"}
        onLayout={(event) => setLayout(event.nativeEvent.layout)}
        data={data}
        renderItem={({ item }) => (
          <View onStartShouldSetResponder={() => true}>
            <OutsideUserElement
              name={item.name}
              username={item.username}
              uid={item.uid}
              imageURL={item.imageURL}
              addFriend={addUserAsFriend}
              sent={sent}
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

export default OutsideUsersDisplay;
