import { StatusBar } from "expo-status-bar";
import { View, SafeAreaView, StyleSheet, Text } from "react-native";
import React, { useState, useEffect } from "react";
import colors from "../assets/colors";
import FriendsHeader from "../components/FriendsHeader";
import FriendsDisplay from "../components/FriendsDisplay";
import OutsideUsersDisplay from "../components/OutsideUsersDisplay";
import SearchBar from "react-native-dynamic-search-bar";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";
import RequestsDisplay from "../components/RequestsDisplay";

// TODO: Fix that tapping outside of the keyboard doesn't make the keyboard go away
const FriendsScreen = ({ navigation }) => {
  const [clear, setClear] = useState(false);
  const clearStyle = useClearStyle(clear);
  const [user, setUser] = useRecoilState(userState);
  const [filter, setFilter] = useState("");
  const [showFriends, setShowFriends] = useState(true);

  const goBack = () => {
    navigation.navigate("Home");
  };

  const displayFriends = () => {
    setShowFriends(true);
  };

  const displayRequests = () => {
    setShowFriends(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={"light-content"} />
      <FriendsHeader
        goBack={goBack}
        displayFriends={displayFriends}
        displayRequests={displayRequests}
        numRequests={user.friendRequests.length}
      />
      {showFriends ? (
        <>
          <SearchBar
            placeholder="Add or search for friends!"
            placeholderTextColor={colors.gray_3}
            // onPress={() => alert("onPress")}
            onChangeText={(text) => {
              setClear(text.length > 0);
              setFilter(text);
            }}
            style={styles.search}
            textInputStyle={styles.searchText}
            searchIconImageStyle={styles.searchIcon}
            searchIconImageSource={require("../assets/searchIcon.png")}
            clearIconImageSource={require("../assets/clear.png")}
            onClearPress={() => {
              setClear(false);
              setFilter("");
            }}
            clearIconImageStyle={clearStyle}
          />
          <View style={styles.display}>
            <FriendsDisplay friends={user.friends} filter={filter} />
            {filter.length >= 3 ? (
              <OutsideUsersDisplay
                friends={user.friends}
                friendRequests={user.friendRequests}
                sent={user.sentRequests}
                text={filter}
              />
            ) : null}
          </View>
        </>
      ) : (
        <View style={styles.display}>
          <RequestsDisplay requests={user.friendRequests} />
        </View>
      )}
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
    // flex: 1,
    backgroundColor: colors.gray_1,
    alignItems: "center",
    marginTop: 24,
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
  display: {
    width: "85%",
    // height: "100%",
    marginTop: 24,
  },
  header: {
    color: colors.gray_3,
    fontFamily: "Nunito-SemiBold",
    fontSize: 16,
    marginBottom: 16,
  },
});

export default FriendsScreen;
