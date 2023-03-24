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
  View,
} from "react-native";
import colors from "../assets/colors";
import { CONSTANTS } from "../constants";

const NameScreen = ({ navigation }) => {
  const [fullName, setfullName] = useState("");
  const [disable, setDisable] = useState(true);
  const inputRef = React.createRef();
  const continueStyle = useContinueStyle(fullName);
  // TODO: For android devices with a notch: https://stackoverflow.com/questions/51289587/how-to-use-safeareaview-for-android-notch-devices

  // TODO: There is a lot of duplicated code with positioning the continue button right above the keyboard (need to manually do it for iOS, but it's automatic for Android). The same pattern is used for all continue buttons on Name, Phone, Verification, and Username screen. Also for the Think button! Perhaps make this a component or figure out a better solution.

  const [textContainerBottom, setTextContainerBottom] = useState(
    new Animated.Value(0)
  );
  const positionStyle = usePositionStyle(textContainerBottom);

  const [keyboardDidShowListener, setKeyboardDidShowListener] = useState(null);

  const checkLength = (text) => {
    setDisable(text.length <= 2);
  };

  const onSubmit = () => {
    navigation.navigate("Phone", {
      paramKey: fullName,
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
      <View>
        <Text style={styles.title}>{CONSTANTS.APP_NAME}</Text>
        <Text style={styles.subtitle}>Welcome! What's your name?</Text>
        <TextInput
          ref={inputRef}
          style={styles.input}
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
      </View>
      <Animated.View style={[positionStyle]}>
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

// Android and iOS have weird behaviors with trying to set buttons right above the keyboard! It looks like Android automatically does it while iOS doesn't
const usePositionStyle = (textContainerBottom) => {
  if (Platform.OS === "ios") {
    return {
      position: "absolute",
      bottom: textContainerBottom,
      alignSelf: "center",
    };
  } else {
    // Android - this assumption might break
    return {
      alignSelf: "center",
      marginBottom: 16,
    };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "pink",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 24,
  },
  title: {
    color: colors.primary_5,
    fontFamily: "Nunito-Bold",
    fontSize: 24,
    marginBottom: 64,
    marginTop: 4,
    alignSelf: "center",
  },
  subtitle: {
    color: colors.primary_9,
    fontFamily: "Nunito-SemiBold",
    fontSize: 16,
    marginBottom: 24,
    alignSelf: "center",
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
    // marginTop: 32,
  },
});

export default NameScreen;
