import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import colors from "../assets/colors";
import { calculateTimeDiffFromNow } from "../helpers";

const ChatElement = ({
  index,
  text,
  username,
  profileURL,
  lastInteraction,
  thought,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          marginTop: index === 0 ? 16 : 0,
          marginBottom: index === -1 ? 48 : 18,
        },
      ]}
    >
      <Image
        style={styles.profileImage}
        source={
          profileURL != ""
            ? { uri: profileURL }
            : require("../assets/default.jpeg")
        }
      />
      <View style={styles.chat}>
        <Text style={styles.thought} numberOfLines={1}>
          {thought}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          <Text style={styles.messageText} numberOfLines={1}>
            {username}: {text}{" "}
          </Text>
          <Text style={styles.timeText}>
            {calculateTimeDiffFromNow(lastInteraction.toDate())}
          </Text>
        </View>
      </View>
      {/* <Text style={styles.time}>
        {calculateTimeDiffFromNow(lastInteraction.toDate())}
      </Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 100,
    marginRight: 12,
  },
  chat: {
    flexDirection: "column",
    flex: 1,
    flexShrink: 1,
  },
  thought: {
    color: colors.gray_9,
    fontFamily: "Nunito-SemiBold",
    fontSize: 18,
  },
  messageText: {
    color: colors.gray_5,
    fontFamily: "Nunito-Regular",
    fontSize: 16,
    width: "90%",
    marginTop: 4,
  },
  timeText: {
    color: colors.gray_5,
    fontFamily: "Nunito-Regular",
    fontSize: 14,
    width: "10%",
    textAlign: "right",
  },
  time: {
    color: colors.gray_3,
    fontFamily: "Nunito-Regular",
    fontSize: 14,
  },
});

export default ChatElement;
