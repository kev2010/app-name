import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import colors from "../assets/colors";
import FriendsHeader from "../components/FriendsHeader";
import { getFriendRequests } from "../api";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";

const FriendsScreen = ({ navigation }) => {
  const [user, setUser] = useRecoilState(userState);
  const [requests, setRequests] = useState([]);

  const getRequests = () => {
    getFriendRequests(user.uid).then((allRequests) => {
      console.log("requests", allRequests);
      setRequests(allRequests);
    });
  };

  useEffect(() => {
    getRequests();
  }, []);

  const goBack = () => {
    navigation.navigate("Home");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={"light-content"} />
      <FriendsHeader goBack={goBack} numRequests={requests.length} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray_1,
    alignItems: "center",
  },
});

export default FriendsScreen;
