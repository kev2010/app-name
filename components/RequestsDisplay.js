import { StyleSheet, FlatList, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import RequestElement from "./RequestElement";
import { getUser, addFriend, deleteFriendRequest } from "../api";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";
import colors from "../assets/colors";

const RequestsDisplay = ({ requests }) => {
  const [user, setUser] = useRecoilState(userState);
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({
    width: 0,
    height: 0,
  });

  // TODO: This is basically a duplicate of the FriendsDisplay function. At some point, there might be a cleaner solution here to not repeat the code
  const getRequestsInfo = (requests) => {
    console.log("counting!", requests.length, requests);
    // TODO: Decide whether we should be doing this logic (converting array of userRefs to array of user objects) in the home screen, friends screen, or here)
    requests.forEach((uid) => {
      getUser(uid).then((user) => {
        const found = data.some((request) => request.uid === uid);
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
    getRequestsInfo(requests);
  }, []);

  const acceptRequest = (uid) => {
    // Remove the friend request (and sent friend request) and add the friend (for both users) to both the global user state AND Firebase state AND local data variable
    return new Promise((resolve, reject) => {
      addFriend(uid, user.uid).then(
        deleteFriendRequest(uid, user.uid).then(() => {
          setUser((user) => ({
            ...user,
            friends: [...user.friends, uid],
            friendRequests: user.friendRequests.filter((id) => id !== uid),
          }));
          setData(data.filter((item) => item.uid !== uid));
          resolve(true);
        })
      );
    });
  };

  const rejectRequest = (uid) => {
    // Remove the friend request (and sent friend request) to both the global user state AND Firebase state AND local data variable
    deleteFriendRequest(uid, user.uid).then(() => {
      setUser((user) => ({
        ...user,
        friendRequests: user.friendRequests.filter((id) => id !== uid),
      }));
      setData(data.filter((item) => item.uid !== uid));
    });
  };

  return requests.length > 0 ? (
    <FlatList
      onLayout={(event) => setLayout(event.nativeEvent.layout)}
      data={data.sort((a, b) => a.name.localeCompare(b.name))}
      renderItem={({ item }) => (
        <RequestElement
          name={item.name}
          username={item.username}
          uid={item.uid}
          acceptRequest={acceptRequest}
          rejectRequest={rejectRequest}
          layout={layout}
        />
      )}
      keyExtractor={(item) => item.uid}
    />
  ) : (
    <View style={styles.empty}>
      <Text style={styles.emoji}>😮</Text>
      <Text style={styles.subtitle}>No requests yet!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  empty: {
    marginTop: 24,
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    // backgroundColor: "purple",
  },
  emoji: {
    fontSize: 48,
  },
  subtitle: {
    color: colors.gray_5,
    fontFamily: "Nunito-SemiBold",
    fontSize: 20,
  },
});

export default RequestsDisplay;
