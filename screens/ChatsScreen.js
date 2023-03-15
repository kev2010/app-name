import { View, SafeAreaView, StyleSheet } from "react-native";
import React from "react";
import colors from "../assets/colors";
import ChatsHeader from "../components/ChatsHeader";
import ChatsDisplay from "../components/ChatsDisplay";

const ChatsScreen = ({ navigation }) => {
  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ChatsHeader goBack={goBack} />
      <View
        style={{
          marginTop: 16,
          borderBottomColor: colors.gray_2,
          borderBottomWidth: StyleSheet.hairlineWidth,
          alignSelf: "stretch",
        }}
      />
      <View style={styles.display}>
        <ChatsDisplay />
      </View>
    </SafeAreaView>
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
    width: "95%",
    paddingBottom: 32,
  },
  header: {
    color: colors.gray_3,
    fontFamily: "Nunito-SemiBold",
    fontSize: 16,
    marginBottom: 16,
  },
});

export default ChatsScreen;
