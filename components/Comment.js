import React, { useState } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import colors from "../assets/colors";

// name, time, comment
const Comment = (props) => {
  return (
    <View style={styles.container}>
      <View style={styles.row1}>
        <Image
          style={styles.profileImage}
          source={require("../assets/fbprofile.jpg")}
          //   source={{uri: props.img}}
          //   resizeMode="stretch"
        />
        <Text style={styles.name}>{props.name}</Text>
        <Text style={styles.time}>{props.time}</Text>
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
    marginBottom: 16,
  },
  row1: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
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
    fontSize: 14,
    color: colors.primary_9,
    fontFamily: "Nunito-Regular",
  },
});

export default Comment;
