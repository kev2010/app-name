import { Image, View, StyleSheet } from "react-native";
import React from "react";
import colors from "../assets/colors";

const friendsIcon = require("../assets/friendsIcon.png");

const FriendsIcon = ({ hasNotification }) => {
  return (
    <View style={styles.imageContainer}>
      <Image source={friendsIcon} style={styles.image} />
      {hasNotification && <View style={styles.notificationCircle} />}
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    position: "relative",
    padding: 5,
  },
  image: {
    width: 32,
    height: 22.5,
    resizeMode: "stretch",
  },
  notificationCircle: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 10,
    backgroundColor: colors.accent1_5,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
});

export default FriendsIcon;
