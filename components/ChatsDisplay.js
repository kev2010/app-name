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
import InviteChatElement from "./InviteChatElement";
import {
  addManuallyMarkedUnread,
  removeManuallyMarkedUnread,
  addArchived,
  removeArchived,
} from "../api";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";
import colors from "../assets/colors";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc, where, collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Swipeable } from "react-native-gesture-handler";

const ChatsDisplay = ({ navigation, archived }) => {
  const [user, setUser] = useRecoilState(userState);
  const [data, setData] = useState([]);
  const [invitedData, setInvitedData] = useState([]);
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
      where("lastInteraction", ">=", cutoff)
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
    let cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const q = query(
      collection(db, "thoughts"),
      where("invited", "array-contains", {
        imageURL: user.imageURL,
        name: user.name,
        selected: true,
        uid: user.uid,
        username: user.username,
      }),
      where("lastInteraction", ">=", cutoff)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("UPDATING INVITED");
      const newData = snapshot.docs
        .map((doc) => ({
          ...doc.data(),
          uid: doc.id,
        }))
        .filter((thought) =>
          thought.invited.some((invitee) => invitee.uid === user.uid)
        );
      console.log("UPDATING INVITEDddd", newData);
      setInvitedData(newData);
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
          data={[
            ...invitedData,
            ...data
              .filter((thought) =>
                userData != null
                  ? archived
                    ? userData.archived.includes(thought.uid)
                    : !userData.archived.includes(thought.uid)
                  : false
              )
              .sort(function (x, y) {
                return y.lastInteraction - x.lastInteraction;
              }),
          ]}
          renderItem={({ item, index }) => {
            // Check if we're looking at invited thoughts or not
            if (
              invitedData.some(
                (invitedThought) => invitedThought.uid === item.uid
              )
            ) {
              return (
                <TouchableOpacity
                  key={index.toString()}
                  onPress={async () => {
                    navigation.navigate("SingleChat", {
                      id: item.uid,
                      creatorID: item.name.id,
                    });
                  }}
                  delayPressIn={200}
                >
                  <InviteChatElement
                    index={
                      index === 0
                        ? 0
                        : index === data.length + invitedData.length - 1
                        ? -1
                        : index
                    }
                    invitedObject={{
                      imageURL: user.imageURL,
                      name: user.name,
                      selected: true,
                      uid: user.uid,
                      username: user.username,
                    }}
                    currentUser={user.username}
                    username={item.username}
                    profileURL={item.profileURL}
                    participants={item.participants}
                    createdTime={item.time}
                    thoughtUID={item.uid}
                    thought={item.thought}
                  />
                </TouchableOpacity>
              );
            } else {
              return (
                <Swipeable
                  renderRightActions={() => renderRightActions(item, archived)}
                >
                  <TouchableOpacity
                    key={index.toString()}
                    onPress={async () => {
                      removeManuallyMarkedUnread(user.uid, item.uid);
                      navigation.navigate("SingleChat", {
                        id: item.uid,
                        creatorID: item.name.id,
                      });
                    }}
                    delayPressIn={200}
                  >
                    <ChatElement
                      index={
                        index === 0
                          ? 0
                          : index === data.length + invitedData.length - 1
                          ? -1
                          : index
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
                        (item.lastReadTimestamps[user.username].time &&
                          item.lastInteraction >
                            item.lastReadTimestamps[user.username].time)
                      }
                    />
                  </TouchableOpacity>
                </Swipeable>
              );
            }
          }}
          keyExtractor={(item, index) => item.uid}
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
