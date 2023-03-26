import { Image, View, StyleSheet, Text } from "react-native";
import React, { useState, useEffect } from "react";
import colors from "../assets/colors";
import { doc, where, collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";

const ChatIcon = () => {
  const [user, setUser] = useRecoilState(userState);
  const [data, setData] = useState([]);
  const [userData, setUserData] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  const getNotificationCount = (ofUser) => {
    let unreadThoughts = ofUser === null ? [] : ofUser.manuallyMarkedUnread;
    data.forEach((thought) => {
      if (
        (ofUser === null ||
          !ofUser.manuallyMarkedUnread.includes(thought.uid)) &&
        thought.lastReadTimestamps !== undefined &&
        thought.lastInteraction > thought.lastReadTimestamps[user.username]
      ) {
        unreadThoughts.push(thought.uid);
      }
    });
    return unreadThoughts.length;
  };

  useEffect(() => {
    setNotificationCount(getNotificationCount(userData));
  }, [userData, data]);

  useEffect(() => {
    let cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const q = query(
      collection(db, "thoughts"),
      where("participants", "array-contains", user.username),
      where("lastInteraction", ">=", cutoff)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("CHANGING q");
      const newData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        uid: doc.id,
      }));
      setData(newData);
    });

    // Clean up the listener when the component is unmounted
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const userRef = doc(db, "users", user.uid);
    const unsubscribeUser = onSnapshot(
      userRef,
      { includeMetadataChanges: true },
      (snapshot) => {
        const newUserData = snapshot.data();
        if (
          newUserData.manuallyMarkedUnread &&
          JSON.stringify(newUserData.manuallyMarkedUnread) !==
            JSON.stringify(userData.manuallyMarkedUnread)
        ) {
          setUserData(newUserData);
        }
      }
    );
    // Clean up the listener when the component is unmounted
    return () => {
      unsubscribeUser();
    };
  }, [userData.manuallyMarkedUnread]);

  return (
    <View style={styles.imageContainer}>
      <Image source={require("../assets/chat.png")} style={styles.image} />
      {notificationCount > 0 ? (
        <View style={styles.notificationCircle}>
          <Text style={styles.notificationNumber}>{notificationCount}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    position: "relative",
    padding: 6,
    marginLeft: 4,
  },
  image: {
    width: 22.5,
    // width: 24,
    height: 22.5,
    resizeMode: "stretch",
  },
  notificationCircle: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 12,
    backgroundColor: colors.primary_5,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  notificationNumber: {
    color: colors.almost_white,
    fontFamily: "Nunito-SemiBold",
    fontSize: 12,
  },
});

export default ChatIcon;
