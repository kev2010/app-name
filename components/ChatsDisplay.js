import {
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import ChatElement from "./ChatElement";
import {
  getUser,
  getRecentReaction,
  getProfilePicture,
  getUserAllChats,
  getParticipants,
  addManuallyMarkedUnread,
  removeManuallyMarkedUnread,
  addArchived,
  removeArchived,
} from "../api";
import { useRecoilState } from "recoil";
import { userState, feedDataState } from "../globalState";
import colors from "../assets/colors";
import {
  useCollectionData,
  useCollection,
  useDocumentData,
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
import { Swipeable } from "react-native-gesture-handler";

const ChatsDisplay = ({ navigation, archived }) => {
  const [user, setUser] = useRecoilState(userState);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(Date.now());

  const userRef = doc(db, "users", user.uid);
  const [userData] = useDocumentData(userRef, {
    idField: "id",
  });

  const markUnread = (thoughtUID) => {
    addManuallyMarkedUnread(user.uid, thoughtUID);
  };

  const markArchived = (thoughtUID) => {
    addArchived(user.uid, thoughtUID);
  };

  const markUnarchived = (thoughtUID) => {
    removeArchived(user.uid, thoughtUID);
  };

  const renderRightActions = (item, archived) => (
    <View style={styles.rightActions}>
      <TouchableOpacity
        style={styles.action}
        onPress={() => {
          markUnread(item.uid);
        }}
      >
        <Image
          style={styles.unreadImage}
          source={require("../assets/unread.png")}
        />
        <Text style={styles.unreadText}>Mark Unread</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.action}
        onPress={() => {
          if (archived) {
            markUnarchived(item.uid);
          } else {
            markArchived(item.uid);
          }
        }}
      >
        <Image
          style={styles.archiveImage}
          source={
            archived
              ? require("../assets/unarchive.png")
              : require("../assets/archiveOrange.png")
          }
        />
        <Text style={styles.archiveText}>
          {archived ? "Unarchive" : "Archive"}
        </Text>
      </TouchableOpacity>
    </View>
  );

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

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 30000);
    return () => {
      clearInterval(interval);
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
          data={data
            .filter((thought) =>
              archived
                ? userData.archived.includes(thought.uid)
                : !userData.archived.includes(thought.uid)
            )
            .sort(function (x, y) {
              return y.lastInteraction - x.lastInteraction;
            })}
          renderItem={({ item, index }) => (
            <Swipeable
              renderRightActions={() => renderRightActions(item, archived)}
              // overshootRight={false}
            >
              <TouchableOpacity
                key={index.toString()}
                onPress={async () => {
                  removeManuallyMarkedUnread(user.uid, item.uid);
                  navigation.navigate("Reactions", {
                    id: item.uid,
                    creatorID: item.name.id,
                  });
                }}
                delayPressIn={200}
              >
                <ChatElement
                  index={
                    index === 0 ? 0 : index === data.length - 1 ? -1 : index
                  }
                  thought={item.thought}
                  lastInteraction={item.lastInteraction}
                  profileURL={item.lastReaction.photoURL}
                  participants={item.participants}
                  currentUser={user.username}
                  username={item.lastReaction.username}
                  text={item.lastReaction.text}
                  unread={
                    userData.manuallyMarkedUnread.includes(item.uid) ||
                    item.lastInteraction >
                      item.lastReadTimestamps[user.username]
                  }
                />
              </TouchableOpacity>
            </Swipeable>
          )}
          keyExtractor={(item) => item.uid}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  rightActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  unreadText: {
    color: colors.accent1_4,
    fontFamily: "Nunito-SemiBold",
    fontSize: 16,
  },
  action: {
    flexDirection: "column",
    alignItems: "center",
    marginLeft: 12,
    marginRight: 12,
  },
  unreadImage: {
    width: 30,
    height: 24,
    marginBottom: 4,
  },
  archiveText: {
    color: colors.accent2_5,
    fontFamily: "Nunito-SemiBold",
    fontSize: 16,
  },
  archiveImage: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
});

export default ChatsDisplay;
