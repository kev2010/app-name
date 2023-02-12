import React, { useEffect, useState } from "react";
import {
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import Thought from "./Thought";
import colors from "../assets/colors";
import { calculateTimeDiffFromNow } from "../helpers";
import { refreshFeed } from "../logic";
import { useRecoilState } from "recoil";
import { feedDataState, feedLockedState } from "../globalState";
import { checkUserPostedToday } from "../api";

const Feed = ({ navigation, uid }) => {
  // TODO: Right now we're only grabbing thoughts in the past 3 days. We'll have to do some pagination later
  // See: https://www.google.com/search?q=how+to+load+a+feed+react+native+without+loading+a+ton+of+data+at+once&sxsrf=AJOqlzX4EO9TgZEKFx0oBmRud5J92fOyqA%3A1674762643643&ei=k9nSY9PnJuik5NoPkZGy4AQ&ved=0ahUKEwiT_dODgeb8AhVoElkFHZGIDEwQ4dUDCBA&uact=5&oq=how+to+load+a+feed+react+native+without+loading+a+ton+of+data+at+once&gs_lcp=Cgxnd3Mtd2l6LXNlcnAQAzoKCAAQRxDWBBCwAzoFCCEQoAE6CAghEBYQHhAdOgUIIRCrAkoECEEYAEoECEYYAFDOEFi0lQlgoJYJaAJwAXgDgAGcAogBjiiSAQYyMS44LjmYAQCgAQHIAQjAAQE&sclient=gws-wiz-serp
  // And: https://stackoverflow.com/questions/71285002/react-native-flatlist-handling-large-data
  const [refreshing, setRefreshing] = useState(false);
  const [feedData, setFeedData] = useRecoilState(feedDataState);
  const [locked, setLocked] = useRecoilState(feedLockedState);

  const DEFAULT = [
    {
      id: 0,
      creatorID: "TAKLar06V3UPXUMll72Kqj51CfG2",
      profileURL: "",
      name: "App Name",
      time: calculateTimeDiffFromNow(new Date()),
      collabs: ["Algorithm", "Admin"],
      reactions: 0,
      imageURL: "",
      thought: "Your feed is a bit empty! Try adding some friends 😎",
    },
  ];

  // TODO: Should this logic be placed in the Feed componenet or HomeScreen?
  const refreshThoughts = () => {
    setRefreshing(true);
    refreshFeed(uid).then((data) => {
      checkUserPostedToday(uid).then((posted) => {
        setLocked(!posted);
        setFeedData(data);
        setRefreshing(false);
      });
    });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      // The screen is focused
      // Call any action and update data
      refreshThoughts();
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  // TODO: VirtualizedList: You have a large list that is slow to update - make sure your renderItem function renders components that follow React performance best practices like PureComponent, shouldComponentUpdate, etc. {"contentLength": 3376.666748046875, "dt": 866, "prevDt": 61523}
  return Object.values(feedData).length > 0 ? (
    <FlatList
      style={{ flex: 1 }}
      data={Object.values(feedData).sort(function (x, y) {
        return y.rawTime - x.rawTime;
      })}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          key={index.toString()}
          onPress={() => {
            navigation.navigate("Reactions", {
              creatorID: item.creatorID,
              id: item.id,
              imageURL: item.imageURL,
              profileURL: item.profileURL,
              name: item.name,
              time: item.time,
              collabs: item.collabs,
              emojis: item.emojis,
              reactions: item.reactions,
              thoughtUID: item.thoughtUID,
              thought: item.thought,
            });
          }}
          disabled={uid === item.creatorID ? false : locked}
        >
          <Thought
            navigation={navigation}
            creatorID={item.creatorID}
            imageURL={item.imageURL}
            profileURL={item.profileURL}
            name={item.name}
            time={item.time}
            collabs={item.collabs}
            emojis={item.emojis}
            reactions={item.reactions}
            thoughtUID={item.thoughtUID}
            thought={item.thought}
            showTrash={false}
            locked={uid === item.creatorID ? false : locked}
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
  ) : refreshing ? (
    // Necessary to check for when Feed is FIRST loaded (where everything is empty)
    // Currently no refreshing animation is shown when empty
    <ActivityIndicator
      style={{ height: "50%" }}
      size="large"
      color={colors.primary_5}
    />
  ) : (
    <FlatList
      data={DEFAULT}
      renderItem={({ item, index }) => (
        <Thought
          navigation={navigation}
          creatorID={item.creatorID}
          imageURL={item.imageURL}
          profileURL={item.profileURL}
          name={item.name}
          time={item.time}
          collabs={item.collabs}
          emojis={item.emojis}
          reactions={item.reactions}
          thoughtUID={item.thoughtUID}
          thought={item.thought}
          showTrash={false}
        />
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
