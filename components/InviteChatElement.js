import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import colors from "../assets/colors";
import { acceptInvite, rejectInvite } from "../api";
import { calculateTimeDiffFromNow, displayParticipants } from "../helpers";

const InviteChatElement = ({
  index,
  currentUser,
  invitedObject,
  username,
  profileURL,
  participants,
  createdTime,
  thoughtUID,
  thought,
}) => {
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
        <TouchableOpacity
          style={{
            height: 32,
            width: 32,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.accent1_1,
            borderRadius: 100,
            marginRight: 16,
          }}
          onPress={() => acceptInvite(invitedObject, thoughtUID)}
        >
          <Image
            style={{
              height: 13.844,
              width: 18,
            }}
            source={require("../assets/check.png")}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            height: 32,
            width: 32,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.primary_1,
            borderRadius: 100,
            marginRight: 4,
          }}
          onPress={() => rejectInvite(invitedObject, thoughtUID)}
        >
          <Image
            style={{
              height: 15.42,
              width: 15.42,
            }}
            source={require("../assets/x.png")}
          />
        </TouchableOpacity>
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
          <Text
            style={[
              styles.messageText,
              {
                fontFamily: "Nunito-Regular",
                color: colors.primary_9,
              },
            ]}
            numberOfLines={1}
          >
            {username} invited you!
          </Text>
          <Text style={styles.timeText}>
            {" "}
            ·{" "}
            {createdTime === undefined || createdTime === null
              ? "Just Now"
              : calculateTimeDiffFromNow(createdTime.toDate())}
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
    flexDirection: "row",
  },
  column2: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingRight: 32,
    width: "80%",
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
    fontSize: 16,
    width: "100%",
    fontFamily: "Nunito-Regular",
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

export default InviteChatElement;
