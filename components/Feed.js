import React, { useEffect, useState } from "react";
import { StyleSheet, FlatList, TouchableOpacity, Text } from "react-native";
import Thought from "./Thought";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  getFirestore,
  getDoc,
  query,
  QuerySnapshot,
} from "firebase/firestore";
// import { TouchableOpacity, Text, View } from "react-native-web";

const Feed = (props) => {
  // TODO: add loading hook?
  const [data, setData] = useState({});

  async function fetchThoughts() {
    try {
      return getDocs(collection(db, "thoughts"));
    } catch (error) {
      console.log(error);
    }
  }

  const fetchUsers = (thoughts) => {
    var results = [];
    thoughts.forEach(function (doc) {
      // push promise from get into results
      results.push(getDoc(doc.data().name));
    });
    return Promise.all(results);
  };

  const refreshThoughts = () => {
    fetchThoughts().then((thoughts) => {
      fetchUsers(thoughts).then((users) => {
        var data = {};
        for (var i = 0; i < thoughts.size; i++) {
          const doc = thoughts.docs[i];
          const user = users[i];
          data[doc.id] = {
            id: doc.id,
            name: user.data().name,
            time: calculateTimeDiffFromNow(doc.data().time.toDate()),
            collabs: [],
            reactions: 5,
            thought: doc.data().thought,
          };
        }
        setData(data);
      });
    });
  };

  useEffect(() => {
    refreshThoughts();
  }, []);

  // assume time is type Date
  const calculateTimeDiffFromNow = (time) => {
    var seconds = Math.floor((new Date() - time) / 1000);
    var interval = seconds / 31536000;

    if (interval > 1) {
      return Math.floor(interval) + "y";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + "mo";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + "d";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + "h";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + "m";
    }

    return Math.floor(seconds) + "s";
  };

  //   const thoughtsRef = firebase.firestore().collection("thoughts");

  // const querySnapshot = await getDocs(collection(db, "users"));

  return (
    <>
      <FlatList
        contentContainerStyle={styles.thoughts}
        data={Object.values(data)}
        renderItem={({ item }) => (
          <Thought
            name={item.name}
            time={item.time}
            collabs={item.collabs}
            reactions={item.reactions}
            thought={item.thought}
          ></Thought>
        )}
        keyExtractor={(item) => item.id}
      />
      <TouchableOpacity onPress={refreshThoughts}>
        <Text>refresh</Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  thoughts: {
    marginHorizontal: 12,
  },
});

export default Feed;
