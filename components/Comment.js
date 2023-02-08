import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import colors from "../assets/colors";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";
import Autolink from "react-native-autolink";

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
      <TouchableOpacity style={styles.profile} onPress={goToProfile}>
        <Image
          style={styles.profileImage}
          source={
            props.imageURL != ""
              ? { uri: props.imageURL }
              : require("../assets/default.jpeg")
          }
        />
        <View style={styles.column}>
          <View style={styles.row}>
            <Text style={styles.name}>{props.name}</Text>
            <Text style={styles.time}>{props.time}</Text>
          </View>
          {/* See https://github.com/joshswan/react-native-autolink */}
          <Autolink style={styles.text} text={props.comment} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  profile: {
    flexDirection: "row",
  },
  column: {
    alignItems: "flex-start",
    flex: 1,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
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
    fontSize: 16,
    fontFamily: "Nunito-ExtraBold",
    lineHeight: 20,
  },
  time: {
    color: colors.gray_3,
    fontSize: 14,
    fontFamily: "Nunito-Regular",
    lineHeight: 20,
  },
  text: {
    fontSize: 16,
    color: colors.primary_9,
    fontFamily: "Nunito-Regular",
  },
});

export default Comment;
