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

const FriendsHeader = ({
  goBack,
  displayFriends,
  displayRequests,
  numRequests,
}) => {
  const [requestsTab, setRequestsTab] = useState(false);
  const [friendsTab, setFriendsTab] = useState(true);
  const requestsStyle = useRequestsStyle(requestsTab);
  const friendsStyle = useFriendsStyle(friendsTab);
  const requestCountStyle = useRequestNumberStyle(numRequests);

  const onPressFriends = () => {
    if (!friendsTab) {
      setFriendsTab(true);
      setRequestsTab(false);
      displayFriends();
    }
  };

  const onPressRequests = () => {
    if (!requestsTab) {
      setFriendsTab(false);
      setRequestsTab(true);
      displayRequests();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>App Name</Text>
        <View style={styles.top}>
          <TouchableOpacity onPress={goBack} style={styles.button}>
            <Image style={styles.back} source={require("../assets/back.png")} />
          </TouchableOpacity>
        </View>
        <View style={styles.tabs}>
          <TouchableOpacity onPress={onPressFriends}>
            <Text style={[styles.type, friendsStyle]}>Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onPressRequests}
            style={styles.requestsTab}
          >
            <Text style={[styles.type, requestsStyle]}>Requests</Text>
            <View style={[styles.requests, requestCountStyle]}>
              <Text style={styles.number}>{numRequests}</Text>
            </View>
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

const useFriendsStyle = (friendsFeed) => {
  return {
    color: friendsFeed ? colors.primary_4 : colors.gray_3,
    fontFamily: friendsFeed ? "Nunito-Bold" : "Nunito-Regular",
  };
};

// Make disappear
const useRequestNumberStyle = (requestNumber) => {
  return {
    opacity: requestNumber == 0 ? 0 : 1,
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
