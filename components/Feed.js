import React, { useState } from "react";
import { StyleSheet, FlatList } from "react-native";
import Thought from "./Thought";

const Feed = (props) => {
  const DATA = [
    {
      id: 0,
      name: "Kevin Jiang",
      time: "4m",
      collabs: ["NAME1"],
      reactions: 5,
      thought: "Some cool text here. Some interesting insights. Yee haw.",
    },
    {
      id: 1,
      name: "Kevin Jiang",
      time: "12m",
      collabs: ["NAME1", "NAME2", "new"],
      reactions: 3,
      thought:
        "Some cool text here. Some interesting insights. Yee haw. Some cool text here. Some interesting insights. Yee haw. Some cool text here. Some interesting insights. Yee haw. Some cool text here. Some interesting insights. Yee haw.",
    },
    {
      id: 2,
      name: "Kevin Jiang",
      time: "1h",
      collabs: [],
      reactions: 0,
      thought:
        "Some cool text here. Some interesting insights. Yee haw. Yee haw. Yee haw. Yee haw. Yee haw. Yee",
    },
    {
      id: 3,
      name: "Kevin Jiang",
      time: "13h",
      collabs: ["NAME1", "Name2"],
      reactions: 12,
      thought: "Some cool text here. Some interesting insights. Yee haw.",
    },
    {
      id: 4,
      name: "Kevin Jiang",
      time: "1d",
      collabs: ["NAME1"],
      reactions: 5,
      thought: "Some cool text here. Some interesting insights. Yee haw.",
    },
    {
      id: 5,
      name: "Kevin Jiang",
      time: "1d",
      collabs: ["NAME1"],
      reactions: 5,
      thought: "Some cool text here. Some interesting insights. Yee haw.",
    },
    {
      id: 6,
      name: "Kevin Jiang",
      time: "1d",
      collabs: ["NAME1"],
      reactions: 5,
      thought: "Some cool text here. Some interesting insights. Yee haw.",
    },
  ];

  return (
    <FlatList
      contentContainerStyle={styles.thoughts}
      data={DATA}
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
  );
};

const styles = StyleSheet.create({
  thoughts: {
    marginHorizontal: 12,
  },
});

export default Feed;
