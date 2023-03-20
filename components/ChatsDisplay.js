import {
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from "react-native";
import React, { useState, useEffect } from "react";
import ChatElement from "./ChatElement";
import {
  getUser,
  getRecentReaction,
  getProfilePicture,
  getUserAllChats,
  getParticipants,
} from "../api";
import { useRecoilState } from "recoil";
import { userState, feedDataState } from "../globalState";
import colors from "../assets/colors";
import {
  useCollectionData,
  useCollection,
} from "react-firebase-hooks/firestore";
import {
  doc,
  where,
  collection,
  query,
  orderBy,
  collectionGroup,
  onSnapshot,
} from "firebase/firestore";
import { db, storage } from "../firebaseConfig";

const ChatsDisplay = ({ navigation }) => {
  const [user, setUser] = useRecoilState(userState);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const q = query(
      collection(db, "thoughts"),
      where("participants", "array-contains", user.username),
      where("time", ">=", cutoff)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        uid: doc.id,
      }));
      setData(newData);
      setLoading(false);
    });

    // Clean up the listener when the component is unmounted
    return () => {
      unsubscribe();
    };
  }, []);

  //   // TODO: Hook in for real time, but can't rn b/c Firebase only supports max 10 for "in" queries
  //   let cutoff = new Date();
  //   cutoff.setDate(cutoff.getDate() - 15);
  //   const [data] = useCollectionData(
  //     query(
  //       collection(db, "thoughts"),
  //       where("participants", "array-contains", user.username),
  //       where("time", ">=", cutoff)
  //     ),
  //     {
  //       idField: "id",
  //     }
  //   );
  //
  //   useEffect(() => {
  //     console.log("data", data);
  //   }, [data]);

  return (
    <>
      {loading ? (
        <ActivityIndicator
          style={{ height: "50%" }}
          size="large"
          color={colors.primary_5}
        />
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          // TODO: make more performant - rn i'm loading everything, then just displaying 30 of them??
          data={
            data.sort(function (x, y) {
              return y.lastInteraction - x.lastInteraction;
            })
            // .slice(0, 10)
          }
          renderItem={({ item, index }) => (
            <TouchableOpacity
              key={index.toString()}
              onPress={async () => {
                navigation.navigate("Reactions", {
                  id: item.uid,
                  creatorID: item.name.id,
                });
              }}
            >
              <ChatElement
                index={index === 0 ? 0 : index === data.length - 1 ? -1 : index}
                thought={item.thought}
                lastInteraction={item.lastInteraction}
                profileURL={item.lastReaction.photoURL}
                participants={item.participants}
                currentUser={user.username}
                username={item.lastReaction.username}
                text={item.lastReaction.text}
              />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.uid}
        />
      )}
    </>
  );
};

export default ChatsDisplay;
