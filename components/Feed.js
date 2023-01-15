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
            //   name: "Kevin Jiang",
            time: "4m",
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
