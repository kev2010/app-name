import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  RefreshControl,
  View,
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
  // TODO: Right now we're only grabbing thoughts in the past 3 days. We'll have to do some pagination later
  // See: https://www.google.com/search?q=how+to+load+a+feed+react+native+without+loading+a+ton+of+data+at+once&sxsrf=AJOqlzX4EO9TgZEKFx0oBmRud5J92fOyqA%3A1674762643643&ei=k9nSY9PnJuik5NoPkZGy4AQ&ved=0ahUKEwiT_dODgeb8AhVoElkFHZGIDEwQ4dUDCBA&uact=5&oq=how+to+load+a+feed+react+native+without+loading+a+ton+of+data+at+once&gs_lcp=Cgxnd3Mtd2l6LXNlcnAQAzoKCAAQRxDWBBCwAzoFCCEQoAE6CAghEBYQHhAdOgUIIRCrAkoECEEYAEoECEYYAFDOEFi0lQlgoJYJaAJwAXgDgAGcAogBjiiSAQYyMS44LjmYAQCgAQHIAQjAAQE&sclient=gws-wiz-serp
  // And: https://stackoverflow.com/questions/71285002/react-native-flatlist-handling-large-data
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
                creatorID: user.id,
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

  return Object.values(data).length > 0 ? (
    <FlatList
      data={Object.values(data)}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          key={index.toString()}
          onPress={() => {
            navigation.navigate("Reactions", {
              creatorID: item.creatorID,
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
            navigation={navigation}
            creatorID={item.creatorID}
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
  ) : (
    <View style={styles.empty}>
      <Text style={styles.thought}>💭</Text>
      <Text style={styles.subtitle}>It’s a bit empty here!</Text>
      <Text style={styles.subtitle}>Try adding some friends 😎</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  empty: {
    marginTop: 24,
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  thought: {
    fontSize: 48,
  },
  subtitle: {
    color: colors.gray_5,
    fontFamily: "Nunito-SemiBold",
    fontSize: 20,
  },
});
export default Feed;
