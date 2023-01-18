import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import colors from "../assets/colors";
import FriendsHeader from "../components/FriendsHeader";
import { getFriendRequests } from "../api";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";
import SearchBar from "react-native-dynamic-search-bar";

const FriendsScreen = ({ navigation }) => {
  const [clear, setClear] = useState(false);
  const clearStyle = useClearStyle(clear);
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
      <SearchBar
        placeholder="Add or search for friends!"
        placeholderTextColor={colors.gray_3}
        // onPress={() => alert("onPress")}
        onChangeText={(text) => {
          console.log(text);
          setClear(text.length > 0);
        }}
        style={styles.search}
        textInputStyle={styles.searchText}
        searchIconImageStyle={styles.searchIcon}
        searchIconImageSource={require("../assets/searchIcon.png")}
        clearIconImageSource={require("../assets/clear.png")}
        onClearPress={() => {
          console.log("what");
          setClear(false);
        }}
        clearIconImageStyle={clearStyle}
      />
    </SafeAreaView>
  );
};

const useClearStyle = (clear) => {
  return {
    opacity: clear ? 1 : 0,
    // TODO: Quite arbitrary - maybe make this a Text component
    width: 36,
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray_1,
    alignItems: "center",
  },
  search: {
    // backgroundColor: "pink",
    marginTop: 8,
    shadowOpacity: 0,
    width: "85%",
  },
  searchText: {
    color: colors.gray_9,
    fontFamily: "Nunito-Regular",
    fontSize: 15,
  },
  searchIcon: {
    width: 14,
    height: 14,
  },
  clear: {
    opacity: 0,
  },
});

export default FriendsScreen;
