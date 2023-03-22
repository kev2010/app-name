import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
import React from "react";
import colors from "../assets/colors";

const ChatsHeader = ({ goBack, archived, seeArchived }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.text}>
          <Text style={styles.title}>{archived ? "Archived" : "Messages"}</Text>
          <Text style={styles.note}>
            {archived
              ? "No notifications on archived chats"
              : "Chats in the past 30 days are shown here"}
          </Text>
        </View>
        <View style={styles.top}>
          <TouchableOpacity onPress={goBack} style={styles.button}>
            <Image style={styles.back} source={require("../assets/back.png")} />
          </TouchableOpacity>
          <TouchableOpacity onPress={seeArchived} style={styles.button}>
            <Image
              style={[
                styles.archive,
                {
                  width: archived ? 22.5 : 18,
                  height: 18,
                },
              ]}
              source={
                archived
                  ? require("../assets/unread.png")
                  : require("../assets/archive.png")
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginTop: 4,
    width: "90%",
  },
  text: {
    flexDirection: "column",
    alignItems: "center",
  },
  note: {
    color: colors.gray_3,
    fontFamily: "Nunito-Regular",
    fontSize: 14,
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
  archive: {
    alignSelf: "center",
    marginRight: -4,
    marginTop: 6,
  },
});

export default ChatsHeader;
