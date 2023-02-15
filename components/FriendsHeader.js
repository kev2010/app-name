import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useState } from "react";
import colors from "../assets/colors";
import { CONSTANTS } from "../constants";

const FriendsHeader = ({
  goBack,
  displayFriends,
  displayRequests,
  displaySuggested,
  numRequests,
}) => {
  const [requestsTab, setRequestsTab] = useState(false);
  const [friendsTab, setFriendsTab] = useState(true);
  const [suggestedTab, setSuggestedTab] = useState(false);
  const requestsStyle = useRequestsStyle(requestsTab);
  const friendsStyle = useFriendsStyle(friendsTab);
  const suggestedStyle = useSuggestedStyle(suggestedTab);

  const onPressFriends = () => {
    if (!friendsTab) {
      setFriendsTab(true);
      setRequestsTab(false);
      setSuggestedTab(false);
      displayFriends();
    }
  };

  const onPressRequests = () => {
    if (!requestsTab) {
      setFriendsTab(false);
      setRequestsTab(true);
      setSuggestedTab(false);
      displayRequests();
    }
  };

  const onPressSuggested = () => {
    if (!suggestedTab) {
      setFriendsTab(false);
      setRequestsTab(false);
      setSuggestedTab(true);
      displaySuggested();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{CONSTANTS.APP_NAME}</Text>
        <View style={styles.top}>
          <TouchableOpacity onPress={goBack} style={styles.button}>
            <Image style={styles.back} source={require("../assets/back.png")} />
          </TouchableOpacity>
        </View>
        <View style={styles.tabs}>
          <TouchableOpacity onPress={onPressFriends}>
            <Text style={[styles.type, friendsStyle]}>Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onPressSuggested}>
            <Text style={[styles.type, suggestedStyle]}>Suggested</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onPressRequests}
            style={styles.requestsTab}
          >
            <Text style={[styles.type, requestsStyle]}>Requests</Text>
            {numRequests > 0 ? (
              <View style={styles.requests}>
                <Text style={styles.number}>{numRequests}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const useRequestsStyle = (requestsTab) => {
  return {
    color: requestsTab ? colors.primary_4 : colors.gray_3,
    fontFamily: requestsTab ? "Nunito-Bold" : "Nunito-Regular",
  };
};

const useFriendsStyle = (friendsTab) => {
  return {
    color: friendsTab ? colors.primary_4 : colors.gray_3,
    fontFamily: friendsTab ? "Nunito-Bold" : "Nunito-Regular",
  };
};

const useSuggestedStyle = (suggestedTab) => {
  return {
    color: suggestedTab ? colors.primary_4 : colors.gray_3,
    fontFamily: suggestedTab ? "Nunito-Bold" : "Nunito-Regular",
  };
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray_1,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginTop: 4,
    width: "90%",
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
  tabs: {
    marginTop: 16,
    marginBottom: 16,
    flexDirection: "row",
  },
  type: {
    fontSize: 16,
    marginHorizontal: 16,
  },
  requestsTab: {
    flexDirection: "row",
  },
  requests: {
    width: 24,
    height: 24,
    borderRadius: 50,
    backgroundColor: colors.accent1_5,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    right: -16,
  },
  number: {
    color: colors.gray_1,
    fontFamily: "Nunito-Regular",
    fontSize: 12,
  },
});

export default FriendsHeader;
