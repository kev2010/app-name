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
import { useRecoilState } from "recoil";
import { verificationState } from "../globalState";
import CountryPicker from "react-native-country-picker-modal";
import {
  FirebaseRecaptchaVerifierModal,
  FirebaseRecaptchaBanner,
} from "expo-firebase-recaptcha";
import { getAuth, PhoneAuthProvider } from "firebase/auth";
import { app } from "../firebaseConfig";
import { dummyCall } from "../api";
import { CONSTANTS } from "../constants";

const auth = getAuth(app);

// Double-check that we can run the example
if (!app?.options || Platform.OS === "web") {
  throw new Error(
    "This example only works on Android or iOS, and requires a valid Firebase config."
  );
}

// TODO LATER: rn only pressing on the flag works vs. pressing on the number
const PhoneScreen = ({ navigation, route }) => {
  const recaptchaVerifier = React.useRef(null);
  const firebaseConfig = app ? app.options : undefined;
  const attemptInvisibleVerification = true;

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
  const [disable, setDisable] = useState(true);
  const [verificationId, setVerificationId] = useRecoilState(verificationState);
  const [number, setNumber] = useState("");
  const inputRef = React.createRef();
  const continueStyle = useContinueStyle(number);
  const [textContainerBottom, setTextContainerBottom] = useState(
    new Animated.Value(0)
  );
  const positionStyle = usePositionStyle(textContainerBottom);

  const [keyboardDidShowListener, setKeyboardDidShowListener] = useState(null);

  dummyCall();

  // TODO: GENERALIZE
  const checkLength = (number) => {
    setDisable(number.length <= 3);
  };

  const onSubmit = async () => {
    console.log("about to submit ", number);
    const fullNumber = `+${country.callingCode}${number}`;
    navigation.navigate("Verification", {
      paramKey: route.params.paramKey,
    });
    // navigation.navigate("Phone");
    // console.log("harhar", globalPhoneNumber);
    // console.log("huh", phoneNumberState);
    // console.log("reee", globalFullName);

    // The FirebaseRecaptchaVerifierModal ref implements the
    // FirebaseAuthApplicationVerifier interface and can be
    // passed directly to `verifyPhoneNumber`.
    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      console.log("cool", fullNumber);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        fullNumber,
        recaptchaVerifier.current
      );
      setVerificationId(verificationId);
      console.log("IDDDDD", verificationId);
    } catch (err) {
      console.log(`Error Phone: ${err.message}`);
      navigation.goBack();
    }
  };

  const onSelectCountry = (country) => {
    setCountryCode(country.cca2);
    setCountry(country);
    inputRef.current.focus();
    console.log(countryCode);
    console.log(country);
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
      <View>
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={firebaseConfig}
          androidLayerType="software"
          attemptInvisibleVerification={attemptInvisibleVerification}
        />
        {/* <StatusBar barStyle={"light-content"} /> */}
        <Text style={styles.title}>{CONSTANTS.APP_NAME}</Text>
        <Text style={styles.subtitle}>
          Hey {route.params.paramKey.split(" ")[0]}! Enter your number📱
        </Text>
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
            textAlign="left"
            selectionColor={colors.primary_4}
            placeholderTextColor={colors.gray_3}
            placeholder="Your number"
            value={number}
            onChangeText={(text) => {
              setNumber(text);
              checkLength(text);
            }}
          />
        </View>
        {/* <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      > */}
      </View>
      <Animated.View style={[positionStyle]}>
        <TouchableOpacity onPress={onSubmit} disabled={disable}>
          <Text style={[styles.continue, continueStyle]}>Send Code</Text>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 24,
  },
  title: {
    marginTop: 4,
    color: colors.primary_5,
    fontFamily: "Nunito-Bold",
    fontSize: 24,
    marginBottom: 64,
    alignSelf: "center",
  },
  subtitle: {
    color: colors.primary_9,
    fontFamily: "Nunito-SemiBold",
    fontSize: 16,
    marginBottom: 24,
    alignSelf: "center",
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
    alignSelf: "stretch",
    // backgroundColor: "pink",
    padding: 0,
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
    marginTop: 32,
  },
});

export default PhoneScreen;
