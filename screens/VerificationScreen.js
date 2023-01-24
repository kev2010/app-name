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
import { dummyCall, checkUserExists } from "../api";

const auth = getAuth(app);

const VerificationScreen = ({ navigation, route }) => {
  const [user, setUser] = useRecoilState(userState);
  const [verificationId, setVerificationId] = useRecoilState(verificationState);
  const [verificationCode, setVerificationCode] = useState("057589");

  dummyCall();

  const onSubmit = async () => {
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
            console.log("snapshot exists!", snapshot);
            console.log("user beforehand", user);

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

            setUser({
              ...snapshot.data,
              uid: userCredential.user.uid,
              friends: userFriends,
              friendRequests: userRequests,
              sentRequests: userSent,
            });
          } else {
            // TODO: Remove?
            setUser({ ...userCredential.user, name: route.params.paramKey });
            navigation.navigate("Username");
          }
        });
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
