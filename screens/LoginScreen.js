import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import colors from "../assets/colors";

const LoginScreen = ({}) => {
  const [fullName, setfullName] = useState("");
  const inputRef = React.createRef();
  const continueStyle = useContinueStyle(fullName);
  const [textContainerBottom, setTextContainerBottom] = useState(
    new Animated.Value(0)
  );

  const [keyboardDidShowListener, setKeyboardDidShowListener] = useState(null);

  const onSubmit = () => {
    console.log("about to submit ", fullName);
  };

  useEffect(() => {
    inputRef.current.focus();
    const keyboardDidShow = (event) => {
      const { endCoordinates } = event;
      const spacing = endCoordinates.height; // TODO Why is this not right on top of the keyboard?
      setTextContainerBottom(spacing);
    };
    setKeyboardDidShowListener(
      Keyboard.addListener("keyboardDidShow", keyboardDidShow)
    );
    return () => {
      if (keyboardDidShowListener) keyboardDidShowListener.remove();
    };
  }, []);

  return (
    // maybe use Safe Area view instead?
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={"light-content"} />
      <Text style={styles.title}>App Name</Text>
      <Text style={styles.subtitle}>Welcome! What's your name?</Text>
      <TextInput
        ref={inputRef}
        // autoFocus={swiped}
        style={styles.input}
        // multiline={true}
        textAlign="center"
        selectionColor={colors.primary_4}
        placeholderTextColor={colors.gray_3}
        placeholder="Your Name"
        value={fullName}
        onChangeText={(text) => setfullName(text)}
      />
      {/* <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      > */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: textContainerBottom,
          alignSelf: "center",
          // backgroundColor: "purple",
        }}
      >
        <TouchableOpacity onPress={onSubmit}>
          <Text style={[styles.continue, continueStyle]}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
      {/* </KeyboardAvoidingView> */}
    </SafeAreaView>
  );
};

const useContinueStyle = (name) => {
  return {
    backgroundColor: name.length > 2 ? colors.primary_5 : colors.gray_2,
    color: name.length > 2 ? colors.almost_white : colors.gray_1,
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "pink",
    alignItems: "center",
    // justifyContent: "space-between",
    marginTop: 4,
  },
  title: {
    color: colors.primary_5,
    fontFamily: "Nunito-Bold",
    fontSize: 24,
    marginBottom: 64,
  },
  subtitle: {
    color: colors.primary_9,
    fontFamily: "Nunito-SemiBold",
    fontSize: 16,
    marginBottom: 24,
  },
  input: {
    color: colors.primary_9,
    // backgroundColor: "green",
    fontFamily: "Nunito-Bold",
    fontSize: 36,
    // This doesn't seem right...?
    marginHorizontal: 24,
  },
  continue: {
    fontFamily: "Nunito-SemiBold",
    fontSize: 18,
    overflow: "hidden",
    borderRadius: 10,
    paddingHorizontal: 128,
    paddingVertical: 12,
    margin: 0,
  },
});

export default LoginScreen;
