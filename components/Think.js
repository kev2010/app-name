import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Keyboard,
  TextInput,
  TouchableOpacity,
} from "react-native";
import colors from "../assets/colors";

const Think = ({ swiped }) => {
  useEffect(() => {
    if (swiped) {
      inputRef.current.focus();
    } else {
      Keyboard.dismiss();
    }
  }, [swiped]);

  const inputRef = React.createRef();

  const onSubmit = () => {};

  return (
    <View style={styles.thinkContainer}>
      <TextInput
        ref={inputRef}
        autoFocus={swiped}
        style={styles.input}
        multiline={true}
        placeholder="What you thinking about? Keep it raw. Develop it as you go!"
      />
      <TouchableOpacity onPress={onSubmit}>
        <Text>Think</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  thinkContainer: {
    flex: 1,
    alignItems: "center",
  },
  input: {
    color: colors.gray_3,
    fontFamily: "Nunito-Medium",
    fontSize: 20,
    // This doesn't seem right...?
    marginHorizontal: 24,
  },
});

export default Think;
