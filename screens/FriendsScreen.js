import {
  View,
  Text,
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
import SuggestedDisplay from "../components/SuggestedDisplay";
import { CONSTANTS } from "../constants";

const FriendsScreen = ({ navigation }) => {
  const [user, setUser] = useRecoilState(userState);
  const [filter, setFilter] = useState("");
  const [showFriends, setShowFriends] = useState(true);
  const [showRequests, setShowRequests] = useState(false);

  const goBack = () => {
    navigation.goBack();
  };

  const displayFriends = () => {
    setShowFriends(true);
    setShowRequests(false);
  };

  const displayRequests = () => {
    setShowFriends(false);
    setShowRequests(true);
  };

  const displaySuggested = () => {
    setShowFriends(false);
    setShowRequests(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <FriendsHeader
          goBack={goBack}
          displayFriends={displayFriends}
          displayRequests={displayRequests}
          displaySuggested={displaySuggested}
          numRequests={user.friendRequests.length}
        />
        <Text style={styles.close}>
          Keep it to close friends! You have a limit of {CONSTANTS.MAX_FRIENDS}.
        </Text>
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
              <FriendsDisplay
                friends={user.friends}
                filter={filter.toLowerCase()}
              />
              {filter.length >= 3 ? (
                <OutsideUsersDisplay text={filter.toLowerCase()} />
              ) : null}
            </View>
          </>
        ) : showRequests ? (
          <View style={styles.display}>
            <RequestsDisplay requests={user.friendRequests} />
          </View>
        ) : (
          <View
            style={[
              styles.display,
              {
                paddingBottom: "25%",
              },
            ]}
          >
            <SuggestedDisplay />
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
    paddingTop: 24,
  },
  close: {
    color: colors.gray_5,
    fontFamily: "Nunito-SemiBold",
    fontSize: 14,
    marginBottom: 8,
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
    fontSize: 16,
  },
  display: {
    width: "85%",
    marginTop: 24,
    paddingBottom: "60%",
  },
  header: {
    color: colors.gray_3,
    fontFamily: "Nunito-SemiBold",
    fontSize: 16,
    marginBottom: 16,
  },
});

export default FriendsScreen;
