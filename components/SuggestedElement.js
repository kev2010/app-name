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
import { useRecoilState } from "recoil";
import { userState } from "../globalState";
import colors from "../assets/colors";
import { CONSTANTS } from "../constants";

const SuggestedElement = ({
  name,
  username,
  uid,
  imageURL,
  addFriend,
  sent,
  layout,
  type,
  mutuals,
}) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useRecoilState(userState);

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
            addFriend(uid).then(() => {
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

  const sentRequestAlreadyAlert = () => {
    Alert.alert(
      "Check Your Requests",
      `${name} already sent you a friend request`,
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

  const onAdd = () => {
    setLoading(true);
    console.log("friend count", user.friends.length);
    if (user.friendRequests.indexOf(uid) === -1) {
      if (user.friends.length <= CONSTANTS.MAX_FRIENDS - 1) {
        addFriendAlert();
      } else {
        maxFriendsAlert();
      }
    } else {
      sentRequestAlreadyAlert();
    }
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
          <View style={styles.topLine}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.username}>{username}</Text>
          </View>
          <Text style={styles.type}>
            {type === "phone"
              ? "From Contacts"
              : mutuals > 1
              ? `${mutuals} mutuals`
              : `${mutuals} mutual`}
          </Text>
        </View>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary_5} />
      ) : sent.indexOf(uid) === -1 ? (
        <TouchableOpacity onPress={onAdd}>
          <Text style={styles.add}>Add</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.sent}>Sent</Text>
      )}
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
  topLine: {
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
    marginLeft: 4,
    color: colors.gray_5,
    fontFamily: "Nunito-Regular",
    fontSize: 14,
  },
  add: {
    color: colors.gray_7,
    fontFamily: "Nunito-SemiBold",
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 10,
    borderColor: colors.gray_5,
    borderWidth: 1,
  },
  sent: {
    color: colors.gray_3,
    fontFamily: "Nunito-SemiBold",
    fontSize: 14,
  },
  type: {
    color: colors.accent1_5,
    fontFamily: "Nunito-Regular",
    fontSize: 14,
  },
});

export default SuggestedElement;
