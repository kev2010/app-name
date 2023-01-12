import React, { useState } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import colors from "../assets/colors";

// img url, name, time, text, collabs, reactions
const Thought = (props) => {
  return (
    <View style={styles.container}>
      <View style={styles.row1}>
        <Image
          style={styles.profileImage}
          source={require("../assets/fbprofile.jpg")}
          //   source={{uri: props.img}}
          //   resizeMode="stretch"
        />
        <Text style={styles.name}>Kevin Jiang</Text>
        <Text style={styles.time}>4m</Text>
      </View>
      <View style={styles.row2}>
        <Text style={styles.text}>
          Some cool text here. Some interesting insights. Yee haw. Some cool
          text here. Some interesting insights. Yee haw. Some cool text here.
          Some interesting insights. Yee haw. Some cool text here. Some
          interesting insights. Yee haw.
        </Text>
      </View>
      <View style={styles.row3}>
        <Text style={styles.thought}>thought with NAME1</Text>
        <View style={styles.actions}>
          <Image
            style={styles.stars}
            source={require("../assets/stars.png")}
            //   source={{uri: props.img}}
            // resizeMode="stretch"
          />
          <Text style={styles.number}>5</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "90%",
    justifyContent: "space-around",
    backgroundColor: colors.almost_white,
    borderRadius: 15,
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
    fontSize: 12,
    fontFamily: "Nunito-SemiBold",
  },
  time: {
    color: colors.gray_3,
    fontSize: 12,
    fontFamily: "Nunito-Regular",
  },
  text: {
    fontSize: 14,
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
