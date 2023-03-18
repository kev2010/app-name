import React from "react";
import { StyleSheet, FlatList, View, Text } from "react-native";
import Comment from "./Comment";
import colors from "../assets/colors";

const ReactionSection = ({ navigation, data }) => {
  // TODO: grab thoughts as you scroll vs. all at once

  return data.length > 0 ? (
    <View style={styles.reactions}>
      {data.map((item, i) => {
        if (
          i != 0 &&
          data[i - 1].creatorID === item.creatorID &&
          // rawTime is serverTimestamp type i think
          Math.floor(item.rawTime - data[i - 1].rawTime) <= 600
        ) {
          return (
            <Comment
              navigation={navigation}
              continued={true}
              creatorID={item.creatorID}
              imageURL={item.imageURL}
              name={item.name}
              time={item.time}
              comment={item.text}
              key={i}
            />
          );
        } else {
          return (
            <Comment
              navigation={navigation}
              continued={false}
              creatorID={item.creatorID}
              imageURL={item.imageURL}
              name={item.name}
              time={item.time}
              comment={item.text}
              key={i}
            />
          );
        }
      })}
    </View>
  ) : (
    <View style={styles.empty}>
      <Text style={styles.thought}>💭</Text>
      <Text style={styles.subtitle}>No chat yet!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  reactions: {
    backgroundColor: colors.almost_white,
    borderRadius: 15,
    paddingBottom: 16,
  },
  divider: {
    borderBottomColor: colors.gray_2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: "90%",
    alignSelf: "center",
  },
  empty: {
    marginTop: 24,
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  thought: {
    fontSize: 48,
  },
  subtitle: {
    color: colors.gray_5,
    fontFamily: "Nunito-SemiBold",
    fontSize: 20,
  },
});

export default ReactionSection;
