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
  View,
} from "react-native";
import colors from "../assets/colors";
import CountryPicker from "react-native-country-picker-modal";

// TODO LATER: rn only pressing on the flag works vs. pressing on the number
const PhoneScreen = ({}) => {
  const [countryCode, setCountryCode] = useState("US");
  const [country, setCountry] = useState({
    callingCode: ["1"],
    cca2: "US",
    currency: ["USD"],
    flag: "flag-us",
    name: "United States",
    region: "Americas",
    subregion: "North America",
  });
  const [number, setNumber] = useState("");
  const inputRef = React.createRef();
  const continueStyle = useContinueStyle(number);
  const [textContainerBottom, setTextContainerBottom] = useState(
    new Animated.Value(0)
  );

  const [keyboardDidShowListener, setKeyboardDidShowListener] = useState(null);

  const onSubmit = () => {
    console.log("about to submit ", number);
  };

  const onSelectCountry = (country) => {
    setCountryCode(country.cca2);
    setCountry(country);
    console.log(countryCode);
    console.log(country);
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
      <Text style={styles.subtitle}>Enter your phone number 📱</Text>
      <View style={styles.number}>
        <View style={styles.border}>
          <CountryPicker
            countryCode={countryCode}
            withFlag={true}
            withCallingCode={true}
            withEmoji={true}
            onSelect={onSelectCountry}
            theme={{
              flagSizeButton: 24,
            }}
          />
          <Text style={styles.countryCode}>+{country.callingCode}</Text>
        </View>
        <TextInput
          ref={inputRef}
          // autoFocus={swiped}
          style={styles.input}
          // multiline={true}
          keyboardType={"phone-pad"}
          textAlign="center"
          selectionColor={colors.primary_4}
          placeholderTextColor={colors.gray_3}
          placeholder="Your Phone"
          value={number}
          onChangeText={(text) => setNumber(text)}
        />
      </View>
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

// TODO: GENERALIZE THE CASE
const useContinueStyle = (number) => {
  return {
    backgroundColor: number.length > 3 ? colors.primary_5 : colors.gray_2,
    color: number.length > 3 ? colors.almost_white : colors.gray_1,
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
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
  number: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 24,
  },
  border: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: colors.gray_3,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 12,
  },
  countryCode: {
    marginLeft: -8,
    color: colors.primary_9,
    fontFamily: "Nunito-Bold",
    fontSize: 12,
  },
  input: {
    color: colors.primary_9,
    fontFamily: "Nunito-Bold",
    fontSize: 36,
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

export default PhoneScreen;
