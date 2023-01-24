import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  RefreshControl,
} from "react-native";
import Thought from "./Thought";
import { getThoughts, getUsersOfThoughts, getCollabsOfThoughts } from "../api";
import colors from "../assets/colors";

const Feed = ({ uid }) => {
  // TODO: add loading hook?
  // TODO: get rid of TouchableOpacity "refresh"
  // TODO: grab thoughts as you scroll vs. all at once
  const [data, setData] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const refreshThoughts = () => {
    setRefreshing(true);
    getThoughts(uid).then((thoughts) => {
      getUsersOfThoughts(thoughts).then((users) => {
        getCollabsOfThoughts(thoughts).then((thoughtCollabs) => {
          // thoughtCollabs = [[obj1, obj2], [obj3], ...]
          var data = {};
          for (var i = 0; i < thoughts.size; i++) {
            const doc = thoughts.docs[i];
            const user = users[i];
            // Grab first name of each collaborator
            const collabs = thoughtCollabs[i].map(
              (user) => user.data().name.split(" ")[0]
            );
            data[doc.id] = {
              id: doc.id,
              name: user.data().name,
              time: calculateTimeDiffFromNow(doc.data().time.toDate()),
              collabs: collabs,
              // TODO: reactions
              reactions: 5,
              thought: doc.data().thought,
            };
          }
          setData(data);
          setRefreshing(false);
        });
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshThoughts}
            colors={[colors.primary_5]}
            tintColor={colors.primary_3}
          />
        }
      />
    </>
  );
};

const styles = StyleSheet.create({
  thoughts: {
    marginHorizontal: 12,
  },
});

export default Feed;
