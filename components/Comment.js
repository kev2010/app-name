import React, { useState } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import colors from "../assets/colors";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";

const Comment = (props) => {
  const [user, setUser] = useRecoilState(userState);

  const goToProfile = () => {
    if (props.creatorID === user.uid) {
      props.navigation.navigate("Settings");
    } else {
      props.navigation.navigate("Profile", {
        creatorID: props.creatorID,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row1}>
        <TouchableOpacity style={styles.profile} onPress={goToProfile}>
          <Image
            style={styles.profileImage}
            source={require("../assets/default.jpeg")}
            //   source={{uri: props.img}}
            //   resizeMode="stretch"
          />
          <Text style={styles.name}>{props.name}</Text>
          <Text style={styles.time}>{props.time}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row2}>
        <Text style={styles.text}>{props.comment}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
  },
  row1: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  row2: {
    flexDirection: "row",
    marginBottom: 8,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 100,
    marginRight: 8,
  },
  name: {
    marginRight: 8,
    color: colors.gray_9,
    fontSize: 14,
    fontFamily: "Nunito-SemiBold",
  },
  time: {
    color: colors.gray_3,
    fontSize: 14,
    fontFamily: "Nunito-Regular",
  },
  text: {
    fontSize: 16,
    color: colors.primary_9,
    fontFamily: "Nunito-Regular",
  },
});

export default Comment;
