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
import colors from "../assets/colors";

const NameScreen = ({ navigation }) => {
  const [fullName, setfullName] = useState("");
  const [disable, setDisable] = useState(true);
  const inputRef = React.createRef();
  const continueStyle = useContinueStyle(fullName);

  // TODO: Issue where the button lies right above the keyboard on iphone, but somehow gets bolted up on android? Temporary fix is to just place the buttons right below the text input

  // const [textContainerBottom, setTextContainerBottom] = useState(
  //   new Animated.Value(0)
  // );

  // const [keyboardDidShowListener, setKeyboardDidShowListener] = useState(null);

  const checkLength = (text) => {
    setDisable(text.length <= 2);
  };

  const onSubmit = () => {
    navigation.navigate("Phone", {
      paramKey: fullName,
    });
    // There seems to be a delay between the local variable and global state update?
    // console.log("harhar", globalFullName);
    // console.log("huh", fullNameState);
  };

  useEffect(() => {
    inputRef.current.focus();
    // const keyboardDidShow = (event) => {
    //   const { endCoordinates } = event;
    //   const spacing = endCoordinates.height + 16;
    //   setTextContainerBottom(spacing);
    // };
    // setKeyboardDidShowListener(
    //   Keyboard.addListener("keyboardDidShow", keyboardDidShow)
    // );
    // return () => {
    //   if (keyboardDidShowListener) keyboardDidShowListener.remove();
    // };
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
        onChangeText={(text) => {
          setfullName(text);
          checkLength(text);
        }}
      />
      <Animated.View>
        <TouchableOpacity onPress={onSubmit} disabled={disable}>
          <Text style={[styles.continue, continueStyle]}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
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
    marginTop: 24,
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
    alignSelf: "stretch",
    color: colors.primary_9,
    // backgroundColor: "green",
    fontFamily: "Nunito-Bold",
    fontSize: 36,
    // This doesn't seem right...?
    marginHorizontal: 24,
    // padding: 0,
    // margin: 0,
  },
  continue: {
    fontFamily: "Nunito-SemiBold",
    fontSize: 18,
    overflow: "hidden",
    borderRadius: 10,
    paddingHorizontal: 128,
    paddingVertical: 12,
    margin: 0,
    marginTop: 32,
  },
});

export default NameScreen;
