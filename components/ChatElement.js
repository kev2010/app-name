import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import colors from "../assets/colors";
import { calculateTimeDiffFromNow, displayParticipants } from "../helpers";

const ChatElement = ({
  index,
  text,
  currentUser,
  username,
  loading,
  profileURL,
  participants,
  lastInteraction,
  thought,
}) => {
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now()), 60000;
    });
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          marginTop: index === 0 ? 16 : 0,
          marginBottom: index === -1 ? 48 : 12,
        },
      ]}
    >
      <View style={styles.column1}>
        {loading ? (
          <ActivityIndicator
            size="small"
            style={{ width: 12, height: 12 }}
            color={colors.primary_5}
          />
        ) : (
          <View
            style={[
              styles.notificationCircle,
              {
                opacity: 0,
              },
            ]}
          />
        )}
      </View>
      <View style={styles.column2}>
        <View style={styles.row1}>
          <Text style={styles.thought} numberOfLines={1}>
            {thought.replace(/\r?\n|\r/g, " ")}
          </Text>
        </View>
        <View style={styles.row2}>
          <Text style={styles.people} numberOfLines={1}>
            {displayParticipants(participants, currentUser)}
          </Text>
        </View>
        <View style={styles.row3}>
          <Image
            style={styles.profileImage}
            source={
              profileURL != ""
                ? { uri: profileURL }
                : require("../assets/default.jpeg")
            }
          />
          <Text style={styles.messageText} numberOfLines={1}>
            {username}: {text}
          </Text>
          <Text style={styles.timeText}>
            {" "}
            · {calculateTimeDiffFromNow(lastInteraction.toDate())}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.almost_white,
    borderRadius: 15,
    paddingRight: 24,
    paddingVertical: 12,
    shadowColor: colors.gray_2,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 0,
  },
  column1: {
    paddingHorizontal: 12,
  },
  notificationCircle: {
    width: 12,
    height: 12,
    borderRadius: 24,
    backgroundColor: colors.primary_5,
    alignItems: "center",
    justifyContent: "center",
  },
  column2: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingRight: 32,
    width: "100%",
  },
  profileImage: {
    width: 24,
    height: 24,
    borderRadius: 100,
    marginRight: 4,
  },
  chat: {
    flexDirection: "column",
    flex: 1,
    flexShrink: 1,
  },
  row1: {
    width: "100%",
    flexDirection: "row",
  },
  thought: {
    color: colors.primary_9,
    fontFamily: "Nunito-Regular",
    fontSize: 16,
    width: "100%",
  },
  row2: {
    marginTop: 4,
  },
  people: {
    color: colors.gray_3,
    fontFamily: "Nunito-Medium",
    fontSize: 14,
  },
  row3: {
    width: "80%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  messageText: {
    color: colors.primary_9,
    fontFamily: "Nunito-Regular",
    fontSize: 14,
  },
  timeText: {
    color: colors.gray_3,
    fontFamily: "Nunito-Regular",
    fontSize: 14,
    textAlign: "right",
  },
  time: {
    color: colors.gray_3,
    fontFamily: "Nunito-Regular",
    fontSize: 14,
  },
});

export default ChatElement;
