import React, { useState } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import colors from "../assets/colors";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";
import Autolink from "react-native-autolink";

const Thought = (props) => {
  const [user, setUser] = useRecoilState(userState);

  let collabsText = "";
  if (props.collabs.length == 1) {
    collabsText = `thought with ${props.collabs[0]}`;
  } else if (props.collabs.length == 2) {
    collabsText = `thought with ${props.collabs[0]} and ${props.collabs[1]}`;
  } else if (props.collabs.length > 2) {
    collabsText = `thought with ${props.collabs[0]}, ${props.collabs[1]}, and more`;
  }

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
      <View
        style={[
          styles.row2,
          { marginBottom: props.collabs.length > 0 ? 16 : 12 },
        ]}
      >
        {/* See https://github.com/joshswan/react-native-autolink */}
        <Autolink style={styles.text} text={props.thought} />
        {/* <Text style={styles.text}>{props.thought}</Text> */}
      </View>
      <View style={styles.row3}>
        <Text style={styles.thought}>{collabsText}</Text>
        <View style={styles.actions}>
          <Image
            style={styles.stars}
            source={require("../assets/stars.png")}
            //   source={{uri: props.img}}
            // resizeMode="stretch"
          />
          <Text style={styles.number}>{props.reactions}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // justifyContent: "space-around",
    backgroundColor: colors.almost_white,
    borderRadius: 15,
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 16,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
  },
  row1: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  row2: {
    flexDirection: "row",
    marginBottom: 16,
  },
  row3: {
    justifyContent: "space-between",
    flexDirection: "row",
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
    lineHeight: 24,
    color: colors.primary_9,
    fontFamily: "Nunito-Regular",
  },
  thought: {
    color: colors.gray_3,
    fontFamily: "Nunito-Bold",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  stars: {
    width: 12,
    height: 16,
    marginRight: 8,
  },
  number: {
    color: colors.primary_5,
    fontFamily: "Nunito-SemiBold",
  },
});

export default Thought;
