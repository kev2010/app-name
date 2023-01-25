import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  Text,
  RefreshControl,
} from "react-native";
import Thought from "./Thought";
import Comment from "./Comment";
import { getUser, getReactions } from "../api";
import colors from "../assets/colors";

const ReactionSection = ({ uid }) => {
  // TODO: add loading hook?
  // TODO: get rid of TouchableOpacity "refresh"
  // TODO: grab thoughts as you scroll vs. all at once
  // TODO: have a default thing shown for no reactions
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const refreshReactions = () => {
    getReactions(uid).then((reactions) => {
      reactions.forEach((reactionDoc) => {
        getUser(reactionDoc.data().name.id).then((user) => {
          const found = data.some((reaction) => reaction.id === reactionDoc.id);
          if (!found) {
            // IMPORTANT: Need to use a function to create a new array since state updates are asynchronous or sometimes batched.
            setData((data) => [
              ...data,
              {
                id: reactionDoc.id,
                name: user.data().name,
                text: reactionDoc.data().text,
                time: calculateTimeDiffFromNow(
                  reactionDoc.data().time.toDate()
                ),
              },
            ]);
          }
        });
      });
    });
  };

  useEffect(() => {
    refreshReactions();
  }, []);

  // assume time is type Date
  // TODO: Put this function in some helper function file (used both here and in Feed.js)
  const calculateTimeDiffFromNow = (time) => {
    var seconds = Math.floor((new Date() - time) / 1000);
    var interval = seconds / 31536000;

    if (interval > 1) {
      return Math.floor(interval) + "y";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + "mo";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + "d";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + "h";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + "m";
    }

    return Math.floor(seconds) + "s";
  };

  return (
    <FlatList
      contentContainerStyle={styles.reactions}
      data={data}
      renderItem={({ item }) => (
        <>
          <Comment name={item.name} time={item.time} comment={item.text} />
          <View style={styles.divider} />
        </>
      )}
      keyExtractor={(item) => item.id}
    />
  );
};

const styles = StyleSheet.create({
  reactions: {
    backgroundColor: colors.almost_white,
    borderRadius: 15,
  },
  divider: {
    borderBottomColor: colors.gray_2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: "90%",
    alignSelf: "center",
  },
});

export default ReactionSection;
