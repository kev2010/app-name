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
} from "react-native";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";
import colors from "../assets/colors";
import { createUser, checkUniqueUsername } from "../api";

// TODO: HANDLE LOGIC WHERE USER W/ PHONE NUMBER ALREADY EXISTS
const UsernameScreen = ({ route, navigation }) => {
  const [user, setUser] = useRecoilState(userState);
  const [username, setUsername] = useState("");
  const [disable, setDisable] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = React.createRef();
  const continueStyle = useContinueStyle(username);
  const errorStyle = useErrorStyle(error);
  const [textContainerBottom, setTextContainerBottom] = useState(
    new Animated.Value(0)
  );

  const [keyboardDidShowListener, setKeyboardDidShowListener] = useState(null);

  const checkLength = (text) => {
    setDisable(text.length <= 2);
  };

  const onSubmit = () => {
    setError(false);
    // TODO: CHECK USERNAME UNIQUENESS
    // TODO: Check for username characters only
    checkUniqueUsername(username).then((unique) => {
      if (unique) {
        createUser(user.uid, user.displayName, username);
        setUser({ ...user, username: username });
      } else {
        setError(true);
      }
    });
  };

  useEffect(() => {
    inputRef.current.focus();
    const keyboardDidShow = (event) => {
      const { endCoordinates } = event;
      const spacing = endCoordinates.height + 16;
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
      <Text style={styles.subtitle}>Finally, choose a unique username!</Text>
      <TextInput
        ref={inputRef}
        // autoFocus={swiped}
        style={styles.input}
        // multiline={true}
        textAlign="center"
        selectionColor={colors.primary_4}
        placeholderTextColor={colors.gray_3}
        placeholder="username"
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          checkLength(text);
        }}
      />
      <Text style={[styles.error, errorStyle]}>Username taken 😔</Text>
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
        <TouchableOpacity onPress={onSubmit} disabled={disable}>
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

const useErrorStyle = (error) => {
  return {
    color: colors.primary_6,
    fontFamily: "Nunito-Regular",
    fontSize: 16,
    opacity: error ? 1 : 0,
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
    marginTop: 4,
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
    marginBottom: 8,
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

export default UsernameScreen;
