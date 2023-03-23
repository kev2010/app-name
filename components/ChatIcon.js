import { Image, View, StyleSheet, Text } from "react-native";
import React, { useState, useEffect } from "react";
import colors from "../assets/colors";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc, where, collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";

const chatIcon = require("../assets/chat.png");

const ChatIcon = ({ hasNotification }) => {
  const [user, setUser] = useRecoilState(userState);
  const [data, setData] = useState([]);
  const userRef = doc(db, "users", user.uid);
  const [userData, setUserData] = useState(null);
  // const [userData] = useDocumentData(userRef, {
  //   idField: "id",
  // });
  const [notificationCount, setNotificationCount] = useState(0);

  const getNotificationCount = (ofUser) => {
    let unreadThoughts = ofUser === null ? [] : ofUser.manuallyMarkedUnread;
    if (ofUser != null) {
      console.log("WTF", ofUser);
    }
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
    console.log(unreadThoughts);
    return unreadThoughts.length;
  };

  useEffect(() => {
    console.log("CHECKING", user);
    setNotificationCount(getNotificationCount(userData));
  }, [userData, data]);

  useEffect(() => {
    console.log("GRABBING DATA");
    let cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const q = query(
      collection(db, "thoughts"),
      where("participants", "array-contains", user.username),
      where("time", ">=", cutoff)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        uid: doc.id,
      }));
      setData(newData);
    });

    const unsubscribeUser = onSnapshot(userRef, (snapshot) => {
      const newUserData = snapshot.data();
      setUserData(newUserData);
    });

    // Clean up the listener when the component is unmounted
    return () => {
      unsubscribe();
    };
  }, []);

  // useEffect(() => {
  //   setNotificationCount(getNotificationCount());
  //   console.log("idk", userData);
  // }, [userData, data]);

  return (
    <View style={styles.imageContainer}>
      <Image source={chatIcon} style={styles.image} />
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
