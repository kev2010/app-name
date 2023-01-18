import React, { useState } from "react";
import { StyleSheet, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { useRecoilState } from "recoil";
import { verificationState, userState } from "../globalState";
import { app } from "../firebaseConfig";
import {
  getAuth,
  signInWithCredential,
  PhoneAuthProvider,
} from "firebase/auth";
import { dummyCall } from "../api";

const auth = getAuth(app);

const VerificationScreen = ({ navigation, route }) => {
  const [user, setUser] = useRecoilState(userState);
  const [verificationId, setVerificationId] = useRecoilState(verificationState);
  const [verificationCode, setVerificationCode] = useState(795035);

  dummyCall();

  const onSubmit = async () => {
    try {
      const credential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      await signInWithCredential(auth, credential).then((userCredential) => {
        // Signed in
        // TODO: Remove?
        setUser({ ...userCredential.user, displayName: route.params.paramKey });
        /*  user: 
            - email
            - uid
            - displayName
            - emailVerified
            - phoneNumber
            - photoURL
            - metadata
            ...
       
        */
        navigation.navigate("Username");
      });
      console.log("Phone authentication successful 👍");
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text>TODO !!!!!!</Text>
      <TouchableOpacity onPress={onSubmit}>
        <Text>submit</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "pink",
    alignItems: "center",
    // justifyContent: "space-between",
    marginTop: 4,
  },
});

export default VerificationScreen;
