import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import colors from "../assets/colors";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";
import { CONSTANTS } from "../constants";
import { sendPushNotification } from "../notifications";

const RequestElement = ({
  name,
  username,
  uid,
  notificationToken,
  imageURL,
  acceptRequest,
  rejectRequest,
  layout,
}) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useRecoilState(userState);

  // TODO: Some duplicate code in OutsideUserElement
  const addFriendAlert = () => {
    Alert.alert(
      "Confirm Add Friend",
      `Are you close friends with ${name}? Make sure to keep your circle tight!`,
      [
        {
          text: "No",
          onPress: () => {
            setLoading(false);
            console.log("CANCELLED");
          },
        },
        {
          text: "Yes",
          onPress: () => {
            acceptRequest(uid).then(() => {
              sendPushNotification(
                notificationToken,
                `${user.name} [${user.username}]`,
                `Accepted your friend request!`,
                {}
              );
              setLoading(false);
            });
          },
          style: "default",
        },
      ]
    );
  };

  const maxFriendsAlert = () => {
    Alert.alert(
      "Friend Limit Reached",
      `You cannot have more than ${CONSTANTS.MAX_FRIENDS} friends! Remove a friend to another.`,
      [
        {
          text: "Understood!",
          onPress: () => {
            setLoading(false);
            console.log("CANCELLED");
          },
          style: "default",
        },
      ]
    );
  };

  const onAccept = () => {
    setLoading(true);
    console.log("friend count", user.friends.length);
    if (user.friends.length <= CONSTANTS.MAX_FRIENDS - 1) {
      addFriendAlert();
    } else {
      maxFriendsAlert();
    }
  };

  const onReject = () => {
    Alert.alert(
      "Confirm Remove Friend Request",
      `Are you sure you want to reject ${name}'s friend request? ${name} will not be notified.`,
      [
        {
          text: "Cancel",
          onPress: () => {
            console.log("CANCELLED");
          },
        },
        {
          text: "Remove",
          onPress: () => {
            console.log("REMOVE", uid);
            rejectRequest(uid);
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: layout.width,
        },
      ]}
    >
      <View style={styles.left}>
        <Image
          style={styles.profileImage}
          source={
            imageURL != ""
              ? { uri: imageURL }
              : require("../assets/default.jpeg")
          }
        />
        <View style={styles.information}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.username}>{username}</Text>
        </View>
      </View>
      <View style={styles.buttons}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.accent1_5} />
        ) : (
          <TouchableOpacity onPress={onAccept}>
            <Text style={styles.accept}>Accept</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onReject} style={styles.smallTouchable}>
          <Image
            style={styles.reject}
            source={require("../assets/reject.png")}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  left: {
    flexDirection: "row",
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 100,
    marginRight: 8,
  },
  information: {
    flexDirection: "column",
    justifyContent: "center",
  },
  name: {
    color: colors.gray_9,
    fontFamily: "Nunito-SemiBold",
    fontSize: 14,
  },
  username: {
    color: colors.gray_5,
    fontFamily: "Nunito-Regular",
    fontSize: 14,
  },
  buttons: {
    flexDirection: "row",
    alignItems: "center",
  },
  accept: {
    backgroundColor: colors.accent1_1,
    color: colors.accent1_8,
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 10,
    borderColor: colors.accent1_3,
    borderWidth: 1,
    overflow: "hidden",
  },
  smallTouchable: {
    paddingVertical: 8,
  },
  reject: {
    marginLeft: 24,
    width: 12,
    height: 12,
  },
});

export default RequestElement;
