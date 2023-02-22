import { Image, View, StyleSheet } from "react-native";
import React from "react";
import colors from "../assets/colors";

const chatIcon = require("../assets/clock.png");

const ChatIcon = ({ hasNotification }) => {
  return (
    <View style={styles.imageContainer}>
      <Image source={chatIcon} style={styles.image} />
      {hasNotification && <View style={styles.notificationCircle} />}
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    position: "relative",
    padding: 6,
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
    width: 16,
    height: 16,
    borderRadius: 10,
    backgroundColor: colors.primary_5,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
});

export default ChatIcon;
