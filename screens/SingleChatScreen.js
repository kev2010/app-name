import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Keyboard,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import SingleChatHeader from "../components/SingleChatHeader";
import colors from "../assets/colors";
import {
  getUser,
  getProfilePictureByUsername,
  getReactions,
  addComment,
  updateLastReadTimestamps,
} from "../api";
import { calculateTimeDiffFromNow } from "../helpers";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";
import Autolink from "react-native-autolink";
import { sendPushNotification } from "../notifications";
import {
  useCollectionData,
  useDocumentData,
} from "react-firebase-hooks/firestore";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { db, storage } from "../firebaseConfig";

const SingleChatScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useRecoilState(userState);
  const [message, setMessage] = useState("");
  const [time, setTime] = useState(Date.now());
  const [disable, setDisable] = useState(true);

  const messagesRef = collection(db, `thoughts/${route.params.id}/reactions`);
  const [data] = useCollectionData(query(messagesRef, orderBy("time")), {
    idField: "id",
  });
  const thoughtRef = doc(db, "thoughts", route.params.id);
  const [thoughtData] = useDocumentData(thoughtRef, {
    idField: "id",
  });
  const [pendingProfilePictures, setPendingProfilePictures] = useState([]);

  const [lastReadMessageIndices, setLastReadMessageIndices] = useState({});

  const updateLastReadMessageIndices = () => {
    const newLastReadMessageIndices = {};

    if (thoughtData && data && thoughtData.lastReadTimestamps) {
      // Iterate through the lastReadTimestamps map
      for (const [username, timestamp] of Object.entries(
        thoughtData.lastReadTimestamps
      )) {
        // Find the last message index that the user has read
        for (let i = data.length - 1; i >= 0; i--) {
          if (
            timestamp &&
            data[i].time &&
            timestamp.toDate() >= data[i].time.toDate()
          ) {
            newLastReadMessageIndices[username] = i;
            break;
          }
        }
      }
    }

    setLastReadMessageIndices(newLastReadMessageIndices);
  };

  useEffect(() => {
    updateLastReadMessageIndices();
    console.log("UDDD");
  }, [thoughtData, data]);

  const scrollViewRef = useRef(null);

  const goBack = () => {
    navigation.goBack();
  };

  const sendNotificationsTo = (userNotificationTokens) => {
    userNotificationTokens.forEach((token) => {
      sendPushNotification(
        token,
        `${user.username} to "${thoughtData.thought}"`,
        message,
        {}
      );
    });
  };

  const checkLength = (text) => {
    setDisable(text.length === 0);
  };

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    );

    return () => {
      keyboardWillShowListener.remove();
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

  useEffect(() => {
    scrollViewRef.current.scrollToEnd({ animated: true });
  }, [message]);

  useEffect(() => {
    console.log("updati????");
    updateLastReadTimestamps(route.params.id, user.username);
  }, [data]);

  const renderReadReceipts = (messageIndex) => {
    console.log("render");
    // Render the mini profile pictures only at the last message a user has read
    return Object.entries(lastReadMessageIndices).map(
      ([username, lastIndex], index) => {
        if (messageIndex === lastIndex && username != user.username) {
          let profile = data.find((msg) => msg.username === username);
          if (profile === undefined) {
            // Check if we already have the profile picture
            const existingProfile = pendingProfilePictures.find(
              (p) => p.username === username
            );
            if (existingProfile) {
              profile = { photoURL: existingProfile.photoURL };
            } else {
              // Call getProfilePictureByUsername and update profilePictures when the URL is returned
              getProfilePictureByUsername(username).then((url) => {
                if (url != undefined) {
                  const newProfilePictures = [
                    ...pendingProfilePictures,
                    { username, photoURL: url },
                  ];
                  setPendingProfilePictures(newProfilePictures);
                }
              });
            }
          }
          return (
            <Image
              key={index}
              source={
                profile != undefined && profile.photoURL != ""
                  ? { uri: profile.photoURL }
                  : require("../assets/default.jpeg")
              }
              style={{
                width: 18,
                height: 18,
                borderRadius: 12,
                marginRight: 4,
                marginBottom: 8,
                marginTop: 4,
              }}
            />
          );
        }
        return null;
      }
    );
  };

  const onSendMessage = () => {
    console.log("Sending message: " + message);
    setLoading(true);
    addComment(
      route.params.id,
      user.uid,
      user.imageURL,
      user.username,
      message
    ).then(() => {
      // Make sure we don't send a push notification if the user replies to their own post!
      if (route.params.creatorID != user.uid) {
        getUser(route.params.creatorID).then((creator) => {
          if (
            creator.data().notificationToken != "" &&
            creator.data().notificationToken != undefined &&
            !creator.data().archived.includes(route.params.id)
          ) {
            sendPushNotification(
              creator.data().notificationToken,
              `${user.username} to "${thoughtData.thought}"`,
              message,
              {}
            );
          }
        });
      }

      // Send notification to all users in the thread if they want it
      getReactions(route.params.id).then((reactions) => {
        let itemsProcessed = 0;
        const seen = new Set();
        reactions.forEach((reactionDoc) => {
          if (
            reactionDoc.data().name.id != user.uid &&
            reactionDoc.data().name.id != route.params.creatorID
          ) {
            getUser(reactionDoc.data().name.id).then((userData) => {
              if (!userData.data().archived.includes(route.params.id)) {
                seen.add(userData.data().notificationToken);
              }

              itemsProcessed++;
              if (itemsProcessed === reactions.size) {
                sendNotificationsTo(seen);
              }
            });
          } else {
            itemsProcessed++;
            if (itemsProcessed === reactions.size) {
              sendNotificationsTo(seen);
            }
          }
        });
      });
      setMessage("");
      setLoading(false);
    });
  };

  // Function to render messages
  const renderMessages = () => {
    console.log("rednerMessages");
    const messages = data.map((message) => {
      return {
        username: message.username,
        sender: message.name.id === user.uid ? "self" : "other",
        profileURL: message.photoURL,
        imageURL: message.imageURL,
        text: message.text,
        timestamp:
          message.time === null
            ? new Date()
            : calculateTimeDiffFromNow(message.time.toDate()),
      };
    });
    return messages.map((message, index) => {
      if (message.sender === "other") {
        // Group messages from the same user together
        if (
          index != 0 &&
          messages[index - 1].sender === "other" &&
          messages[index - 1].username === message.username &&
          (index == messages.length - 1 ||
            messages[index + 1].username != message.username)
        ) {
          // This is for the last message from the user
          return (
            <View key={index} style={{ flexDirection: "column" }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  marginBottom: 12,
                }}
              >
                <Image
                  source={
                    message.profileURL != ""
                      ? { uri: message.profileURL }
                      : require("../assets/default.jpeg")
                  }
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    marginRight: 8,
                  }}
                />
                {message.imageURL != "" ? (
                  <View style={styles.photoView}>
                    <Image
                      style={styles.photo}
                      source={{ uri: message.imageURL }}
                    />
                  </View>
                ) : (
                  <View style={{ maxWidth: "82%", alignItems: "flex-start" }}>
                    <View style={styles.otherTextBubble}>
                      <Autolink style={styles.otherText} text={message.text} />
                    </View>
                  </View>
                )}
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                }}
              >
                {renderReadReceipts(index)}
              </View>
            </View>
          );
        } else if (
          index != 0 &&
          messages[index - 1].sender === "other" &&
          messages[index - 1].username === message.username &&
          messages[index + 1].username === message.username
        ) {
          // This is for the middle messages from the user
          return (
            <View key={index} style={{ flexDirection: "column" }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  marginBottom: 4,
                }}
              >
                <Image
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    marginRight: 8,
                    opacity: 0,
                  }}
                />
                {message.imageURL != "" ? (
                  <View style={styles.photoView}>
                    <Image
                      style={styles.photo}
                      source={{ uri: message.imageURL }}
                    />
                  </View>
                ) : (
                  <View style={{ maxWidth: "82%", alignItems: "flex-start" }}>
                    <View style={styles.otherTextBubble}>
                      <Autolink style={styles.otherText} text={message.text} />
                    </View>
                  </View>
                )}
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                }}
              >
                {renderReadReceipts(index)}
              </View>
            </View>
          );
        } else if (
          index != messages.length - 1 &&
          messages[index + 1].sender === "other" &&
          messages[index + 1].username === message.username
        ) {
          // This is the start of a group of messages from the user
          return (
            <View key={index} style={{ flexDirection: "column" }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  marginBottom: 4,
                  marginTop: index === 0 ? 12 : 0,
                }}
              >
                <Image
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    marginRight: 8,
                    opacity: 0,
                  }}
                />
                {message.imageURL != "" ? (
                  <View>
                    <View style={styles.info}>
                      <Text style={styles.username}>{message.username}</Text>
                      <Text style={styles.timestamp}>{message.timestamp}</Text>
                    </View>
                    <View style={styles.photoView}>
                      <Image
                        style={styles.photo}
                        source={{ uri: message.imageURL }}
                      />
                    </View>
                  </View>
                ) : (
                  <View style={{ maxWidth: "82%", alignItems: "flex-start" }}>
                    <View style={styles.info}>
                      <Text style={styles.username}>{message.username}</Text>
                      <Text style={styles.timestamp}>{message.timestamp}</Text>
                    </View>
                    <View style={styles.otherTextBubble}>
                      <Autolink style={styles.otherText} text={message.text} />
                    </View>
                  </View>
                )}
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                }}
              >
                {renderReadReceipts(index)}
              </View>
            </View>
          );
        } else {
          // This is for a single message from a user
          return (
            <View key={index} style={{ flexDirection: "column" }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  marginBottom: 12,
                  marginTop: index === 0 ? 12 : 0,
                }}
              >
                <Image
                  source={
                    message.profileURL != ""
                      ? { uri: message.profileURL }
                      : require("../assets/default.jpeg")
                  }
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    marginRight: 8,
                  }}
                />
                {message.imageURL != "" ? (
                  <View>
                    <View style={styles.info}>
                      <Text style={styles.username}>{message.username}</Text>
                      <Text style={styles.timestamp}>{message.timestamp}</Text>
                    </View>
                    <View style={styles.photoView}>
                      <Image
                        style={styles.photo}
                        source={{ uri: message.imageURL }}
                      />
                    </View>
                  </View>
                ) : (
                  <View style={{ maxWidth: "82%", alignItems: "flex-start" }}>
                    <View style={styles.info}>
                      <Text style={styles.username}>{message.username}</Text>
                      <Text style={styles.timestamp}>{message.timestamp}</Text>
                    </View>
                    <View style={styles.otherTextBubble}>
                      <Autolink style={styles.otherText} text={message.text} />
                    </View>
                  </View>
                )}
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                }}
              >
                {renderReadReceipts(index)}
              </View>
            </View>
          );
        }
      } else {
        // This is for messages sent by the user itself
        return (
          <View
            key={index}
            style={{
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              marginTop: index === 0 ? 12 : 2,
              marginBottom:
                index != messages.length - 1 &&
                messages[index + 1].sender === "self"
                  ? 0
                  : 12,
            }}
          >
            {message.imageURL != "" ? (
              <View style={styles.photoView}>
                <Image
                  style={styles.photo}
                  source={{ uri: message.imageURL }}
                />
              </View>
            ) : (
              <View style={{ maxWidth: "82%", alignItems: "flex-start" }}>
                <View style={styles.userTextBubble}>
                  <Autolink
                    style={styles.userText}
                    text={message.text}
                    linkStyle={{
                      color: "white",
                      textDecorationLine: "underline",
                    }}
                  />
                </View>
              </View>
            )}
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
              }}
            >
              {renderReadReceipts(index)}
            </View>
          </View>
        );
      }
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <SingleChatHeader goBack={goBack} />
        <View
          style={{
            marginTop: 16,
            borderBottomColor: colors.gray_2,
            borderBottomWidth: StyleSheet.hairlineWidth,
            alignSelf: "stretch",
          }}
        />
        <ScrollView
          style={styles.messages}
          ref={scrollViewRef}
          onContentSizeChange={() =>
            scrollViewRef.current.scrollToEnd({ animated: false })
          }
        >
          {data && renderMessages()}
        </ScrollView>
        <View style={styles.inputView}>
          <TextInput
            style={styles.input}
            placeholder="Message"
            multiline={true}
            maxHeight={128}
            value={message}
            onChangeText={(text) => {
              setMessage(text);
              checkLength(text);
            }}
          />
          <TouchableOpacity onPress={onSendMessage} disabled={disable}>
            <Image
              style={[
                styles.send,
                {
                  opacity: message.length > 0 ? 1 : 0.3,
                },
              ]}
              source={require("../assets/send.png")}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray_1,
    paddingTop: 24,
    alignItems: "center",
  },
  messages: {
    flex: 1,
    width: "90%",
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
    marginBottom: 2,
  },
  username: {
    color: colors.gray_5,
    fontFamily: "Nunito-Medium",
    fontSize: 14,
    marginRight: 8,
  },
  timestamp: {
    color: colors.gray_3,
    fontFamily: "Nunito-Regular",
    fontSize: 14,
  },
  otherTextBubble: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    shadowColor: colors.gray_2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 0,
  },
  userTextBubble: {
    backgroundColor: colors.primary_5,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    shadowColor: colors.gray_2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 0,
  },
  otherText: {
    color: colors.primary_9,
    fontFamily: "Nunito-Regular",
    fontSize: 16,
  },
  userText: {
    color: colors.almost_white,
    fontFamily: "Nunito-Regular",
    fontSize: 16,
  },
  photoView: {
    flexDirection: "row",
    // Breaking the system!
    width: 300,
    height: 300,
    borderRadius: 15,
    borderColor: colors.gray_2,
    borderWidth: 0.5,
    overflow: "hidden",
    backgroundColor: colors.almost_white,
  },
  photo: {
    width: "100%",
    resizeMode: "contain",
  },
  inputView: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    padding: 10,
    width: "90%",
  },
  input: {
    flex: 1,
    backgroundColor: colors.almost_white,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    fontFamily: "Nunito-Regular",
    fontSize: 16,
  },
  send: {
    width: 24,
    height: 21.2,
    marginLeft: 16,
    marginBottom: 8,
  },
});

export default SingleChatScreen;
