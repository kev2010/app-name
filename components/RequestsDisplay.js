import { StyleSheet, FlatList, Text } from "react-native";
import React, { useState, useEffect } from "react";
import RequestElement from "./RequestElement";
import { getUser, addFriend, deleteFriendRequest } from "../api";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";
import colors from "../assets/colors";

// TODO: Do alphabetic sorting
const RequestsDisplay = ({ requests }) => {
  const [user, setUser] = useRecoilState(userState);
  const [data, setData] = useState([]);
  const [layout, setLayout] = useState({
    width: 0,
    height: 0,
  });

  // TODO: This is basically a duplicate of the FriendsDisplay function. At some point, there might be a cleaner solution here to not repeat the code
  const getRequestsInfo = (requests) => {
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

  return (
    // TODO: Set up a default display when there are 0 friend requests
    <>
      {/* <Text style={styles.header}>All Requests</Text> */}
      <FlatList
        onLayout={(event) => setLayout(event.nativeEvent.layout)}
        data={data}
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

export default RequestsDisplay;
