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

const FriendElement = ({ name, username, uid, layout, remove }) => {
  const onRemove = () => {
    Alert.alert(
      "Confirm Friend Removal",
      `Are you sure you want to no longer be friends with ${name}? You can't see ${name}'s thoughts anymore and yours will no longer be visible.`,
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
            console.log("DELETEE", uid);
            remove(uid);
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
          source={require("../assets/default.jpeg")}
        />
        <View style={styles.information}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.username}>{username}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onRemove} style={styles.button}>
        <Image style={styles.remove} source={require("../assets/remove.png")} />
      </TouchableOpacity>
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
  // TODO: This is not perfect - if the user taps slightly to the right, it will not register
  button: {
    paddingVertical: 12,
    paddingLeft: 12,
  },
  remove: {
    width: 12,
    height: 12,
  },
});

export default FriendElement;
