import React from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import colors from "../assets/colors";
import { calculateTimeDiffFromNow, displayParticipants } from "../helpers";

const ChatElement = ({
  index,
  text,
  currentUser,
  currentUserPicture,
  username,
  profileURL,
  participants,
  unread,
  lastInteraction,
  lastReadTimestamps,
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
        <View
          style={[
            styles.notificationCircle,
            {
              opacity: unread ? 1 : 0,
            },
          ]}
        />
      </View>
      <View style={styles.column2}>
        <View style={styles.row1}>
          <Text
            style={[
              styles.thought,
              {
                fontFamily: unread ? "Nunito-ExtraBold" : "Nunito-Regular",
              },
            ]}
            numberOfLines={1}
          >
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
                fontFamily: unread ? "Nunito-ExtraBold" : "Nunito-Regular",
                color: unread ? colors.gray_9 : colors.gray_3,
              },
            ]}
            numberOfLines={1}
          >
            {username}: {text}
          </Text>
          <Text style={styles.timeText}>
            {" "}
            ·{" "}
            {lastInteraction === undefined || lastInteraction === null
              ? "0s"
              : calculateTimeDiffFromNow(lastInteraction.toDate())}
          </Text>
          {lastReadTimestamps &&
            username === currentUser &&
            // Filter out the current user

            Object.entries(lastReadTimestamps)
              .filter(
                (userObj) =>
                  userObj[1].photoURL != currentUserPicture &&
                  userObj[1].time != null &&
                  userObj[1].time.toDate() >= lastInteraction.toDate()
              )
              .map((userObj, index) => {
                if (index < 3) {
                  return (
                    <Image
                      key={index}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 16,
                        borderColor: colors.almost_white,
                        borderWidth: 1,
                        marginLeft: index == 0 ? 4 : -6,
                      }}
                      source={
                        userObj[1].photoURL != ""
                          ? { uri: userObj[1].photoURL }
                          : require("../assets/default.jpeg")
                      }
                    />
                  );
                } else if (index === 3) {
                  return (
                    <View
                      key={index}
                      style={{
                        width: 28,
                        height: 20,
                        borderRadius: 14,
                        borderColor: colors.almost_white,
                        borderWidth: 1,
                        marginLeft: 2,
                        backgroundColor: colors.gray_1,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: colors.gray_3,
                          fontSize: 12,
                          fontWeight: "bold",
                          fontFamily: "Nunito-SemiBold",
                        }}
                      >
                        +
                        {Object.entries(lastReadTimestamps).filter(
                          (userObj) => userObj[1].photoURL != currentUserPicture
                        ).length - 3}
                      </Text>
                    </View>
                  );
                }
              })}
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
    width: 32,
    height: 32,
    borderRadius: 100,
    marginRight: 4,
  },
  row1: {
    width: "100%",
    flexDirection: "row",
  },
  thought: {
    color: colors.primary_9,
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
    width: "55%",
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
});

export default ChatElement;
