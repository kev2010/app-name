import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  TextInput,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { useRecoilState } from "recoil";
import { verificationState, userState } from "../globalState";
import { app } from "../firebaseConfig";
import {
  getAuth,
  signInWithCredential,
  PhoneAuthProvider,
} from "firebase/auth";
import { checkUserExists, getProfilePicture } from "../api";
import colors from "../assets/colors";

const auth = getAuth(app);

const VerificationScreen = ({ navigation, route }) => {
  const [user, setUser] = useRecoilState(userState);
  const [verificationId, setVerificationId] = useRecoilState(verificationState);
  const [verificationCode, setVerificationCode] = useState("");
  const inputRef = React.createRef();
  const [disable, setDisable] = useState(true);
  const continueStyle = useContinueStyle(verificationCode);
  const [textContainerBottom, setTextContainerBottom] = useState(
    new Animated.Value(0)
  );
  const positionStyle = usePositionStyle(textContainerBottom);
  const [errorMessage, setErrorMessage] = useState("");
  const invalidCodeErrorMessage = "Invalid code 😔";
  const [error, setError] = useState(false);
  const errorStyle = useErrorStyle(error);
  const [loading, setLoading] = useState(false);

  const [keyboardDidShowListener, setKeyboardDidShowListener] = useState(null);

  const checkLength = (number) => {
    setDisable(number.length != 6);
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

  const onSubmit = async () => {
    setLoading(true);
    setError(false);
    try {
      const credential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      await signInWithCredential(auth, credential).then((userCredential) => {
        // Signed in -- set the user depending on first time or returning
        /*  userCredential.user: 
            - email
            - uid
            - displayName
            - emailVerified
            - phoneNumber
            - photoURL
            - metadata
            ...
       
        */
        checkUserExists(userCredential.user.uid).then((snapshot) => {
          if (snapshot.exists) {
            // The reason for this complication is explain in the duplicate code in HomeScreen.js
            const userFriends = snapshot.data.friends.map((userRef) => {
              return userRef.id;
            });
            const userRequests = snapshot.data.friendRequests.map((userRef) => {
              return userRef.id;
            });
            const userSent = snapshot.data.sentRequests.map((userRef) => {
              return userRef.id;
            });

            getProfilePicture(userCredential.user.uid).then((downloadURL) => {
              setUser((user) => ({
                uid: userCredential.user.uid,
                friends: userFriends,
                friendRequests: userRequests,
                sentRequests: userSent,
                name: snapshot.data.name,
                username: snapshot.data.username,
                imageURL: downloadURL,
              }));
              setLoading(false);
            });
          } else {
            setUser({ ...userCredential.user, name: route.params.paramKey });
            navigation.navigate("Username");
            setLoading(false);
          }
        });
      });
      console.log("Phone authentication successful 👍");
    } catch (err) {
      console.log(`Error Verification: ${err.message}`);
      setLoading(false);
      setError(true);
      setErrorMessage(invalidCodeErrorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <StatusBar barStyle={"light-content"} />
        <Text style={styles.title}>App Name</Text>
        <Text style={styles.subtitle}>Enter the code we sent!</Text>
        <View style={styles.number}>
          <TextInput
            ref={inputRef}
            // autoFocus={swiped}
            style={styles.input}
            // multiline={true}
            keyboardType={"number-pad"}
            textAlign="left"
            selectionColor={colors.primary_4}
            placeholderTextColor={colors.gray_3}
            placeholder="••••••"
            value={verificationCode}
            onChangeText={(text) => {
              if (text.length <= 6) {
                setVerificationCode(text);
                checkLength(text);
              }
            }}
          />
          <Text style={errorStyle}>{errorMessage}</Text>
        </View>
      </View>
      <Animated.View style={[positionStyle]}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={colors.primary_5}
            style={styles.continue}
          />
        ) : (
          <TouchableOpacity onPress={onSubmit} disabled={disable}>
            <Text style={[styles.continue, continueStyle]}>Verify</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const useErrorStyle = (error) => {
  return {
    color: colors.primary_6,
    fontFamily: "Nunito-Regular",
    fontSize: 16,
    width: "100%",
    textAlign: "center",
    alignSelf: "center",
    opacity: error ? 1 : 0,
  };
};

const useContinueStyle = (number) => {
  return {
    backgroundColor: number.length === 6 ? colors.primary_5 : colors.gray_2,
    color: number.length === 6 ? colors.almost_white : colors.gray_1,
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
    marginTop: 24,
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
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 24,
  },
  input: {
    alignSelf: "stretch",
    // backgroundColor: "pink",
    padding: 0,
    color: colors.primary_9,
    fontFamily: "Nunito-Bold",
    fontSize: 36,
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
    marginTop: 32,
  },
});

export default VerificationScreen;
