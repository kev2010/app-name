import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  RefreshControl,
} from "react-native";
import Thought from "./Thought";
import {
  getThoughts,
  getUsersOfThoughts,
  getCollabsOfThoughts,
  getReactionsSizeOfThoughts,
} from "../api";
import colors from "../assets/colors";
import { calculateTimeDiffFromNow } from "../helpers";

const Feed = ({ navigation, uid }) => {
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
          getReactionsSizeOfThoughts(thoughts).then((reactionSizes) => {
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
                reactions: reactionSizes[i],
                thought: doc.data().thought,
              };
            }
            setData(data);
            setRefreshing(false);
          });
        });
      });
    });
  };

  useEffect(() => {
    refreshThoughts();
  }, []);

  //   const thoughtsRef = firebase.firestore().collection("thoughts");

  // const querySnapshot = await getDocs(collection(db, "users"));

  return (
    <FlatList
      data={Object.values(data)}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          key={index.toString()}
          onPress={() => {
            console.log("just pressed", item);
            navigation.navigate("Reactions", {
              id: item.id,
              name: item.name,
              time: item.time,
              collabs: item.collabs,
              reactions: item.reactions,
              thought: item.thought,
            });
          }}
        >
          <Thought
            name={item.name}
            time={item.time}
            collabs={item.collabs}
            reactions={item.reactions}
            thought={item.thought}
          />
        </TouchableOpacity>
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
  );
};

export default Feed;
