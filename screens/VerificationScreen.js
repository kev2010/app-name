import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { useRecoilState } from "recoil";
import { verificationState } from "../globalState";
import { app } from "../firebaseConfig";
import {
  getAuth,
  signInWithCredential,
  PhoneAuthProvider,
} from "firebase/auth";

const auth = getAuth(app);

const VerificationScreen = ({ navigation }) => {
  const [verificationId, setVerificationId] = useRecoilState(verificationState);
  const [verificationCode, setVerificationCode] = React.useState();
  console.log(verificationId);

  const onSubmit = async () => {
    try {
      const credential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      await signInWithCredential(auth, credential);
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
