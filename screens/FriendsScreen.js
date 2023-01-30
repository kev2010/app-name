import { StatusBar } from "expo-status-bar";
import {
  View,
  SafeAreaView,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState } from "react";
import colors from "../assets/colors";
import FriendsHeader from "../components/FriendsHeader";
import FriendsDisplay from "../components/FriendsDisplay";
import OutsideUsersDisplay from "../components/OutsideUsersDisplay";
import { SearchBar } from "react-native-elements";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";
import RequestsDisplay from "../components/RequestsDisplay";

const FriendsScreen = ({ navigation }) => {
  const [user, setUser] = useRecoilState(userState);
  const [filter, setFilter] = useState("");
  const [showFriends, setShowFriends] = useState(true);

  const goBack = () => {
    navigation.goBack();
  };

  const displayFriends = () => {
    setShowFriends(true);
  };

  const displayRequests = () => {
    setShowFriends(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
              containerStyle={styles.search}
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.searchText}
              placeholder="Add or search for friends!"
              placeholderTextColor={colors.gray_3}
              onChangeText={(text) => {
                setFilter(text);
              }}
              value={filter}
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
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray_1,
    alignItems: "center",
    marginTop: 24,
  },
  search: {
    backgroundColor: colors.gray_1,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    marginTop: 8,
    padding: 0,
    width: "85%",
  },
  inputContainer: {
    backgroundColor: colors.almost_white,
    borderRadius: 15,
  },
  searchText: {
    color: colors.gray_9,
    fontFamily: "Nunito-Regular",
    fontSize: 15,
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
