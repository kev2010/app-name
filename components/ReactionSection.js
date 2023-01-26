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

const ReactionSection = ({ navigation, data }) => {
  // TODO: add loading hook?
  // TODO: grab thoughts as you scroll vs. all at once
  // TODO: have a default thing shown for no reactions

  return (
    <FlatList
      contentContainerStyle={styles.reactions}
      data={data}
      renderItem={({ item }) => (
        <>
          <Comment
            navigation={navigation}
            creatorID={item.creatorID}
            name={item.name}
            time={item.time}
            comment={item.text}
          />
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
