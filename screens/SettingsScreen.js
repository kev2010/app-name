import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import React from "react";
import colors from "../assets/colors";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";

// TODO: Fix that tapping outside of the keyboard doesn't make the keyboard go away
const SettingsScreen = ({ navigation }) => {
  const [user, setUser] = useRecoilState(userState);
  const goBack = () => {
    navigation.goBack();
  };

  const onLogOut = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        onPress: () => {
          console.log("CANCELLED");
        },
      },
      {
        text: "Log Out",
        onPress: () => {
          console.log("LOG OUT", user.uid);
          setUser({});
          navigation.navigate("Name");
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.top}>
          <TouchableOpacity onPress={goBack} style={styles.button}>
            <Image style={styles.back} source={require("../assets/back.png")} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.info}>
        Logged in as {user.name} with username {user.username}
      </Text>
      <TouchableOpacity onPress={onLogOut}>
        <Text style={styles.logOut}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: colors.gray_1,
    alignItems: "center",
    marginTop: 24,
  },
  header: {
    alignItems: "center",
    marginTop: 4,
    width: "90%",
  },
  info: {
    fontFamily: "Nunito-Regular",
    fontSize: 16,
    color: colors.primary_9,
    marginTop: 24,
    alignSelf: "center",
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    // backgroundColor: "pink",
    width: "100%",
    position: "absolute",
  },
  title: {
    color: colors.primary_5,
    fontFamily: "Nunito-Bold",
    fontSize: 24,
    justifyContent: "center",
  },
  button: {
    paddingRight: 16,
    paddingBottom: 16,
  },
  back: {
    width: 10.85,
    height: 18.95,
    alignSelf: "center",
    // TODO: Arbitrary numbers????
    marginLeft: 4,
    marginTop: 6,
  },
  logOut: {
    fontFamily: "Nunito-SemiBold",
    fontSize: 18,
    overflow: "hidden",
    borderRadius: 10,
    paddingHorizontal: 128,
    paddingVertical: 12,
    margin: 0,
    marginTop: 32,
    backgroundColor: colors.primary_1,
    color: colors.primary_6,
  },
});

export default SettingsScreen;
