import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import SingleChatHeader from "../components/SingleChatHeader";
import { useNavigation } from "@react-navigation/native";
import colors from "../assets/colors";
import {
  getUser,
  getProfilePicture,
  getReactions,
  getThought,
  getThoughtImage,
  addComment,
} from "../api";
import { calculateTimeDiffFromNow } from "../helpers";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";
import Autolink from "react-native-autolink";
import { sendPushNotification } from "../notifications";

const SingleChatScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useRecoilState(userState);
  const [data, setData] = useState([]);
  const [creatorID, setCreatorID] = useState("");
  const [originalThought, setOriginalThought] = useState("");
  const [message, setMessage] = useState("");

  const scrollViewRef = useRef(null);

  const goBack = () => {
    navigation.goBack();
  };

  const sendNotificationsTo = (userNotificationTokens) => {
    userNotificationTokens.forEach((token) => {
      sendPushNotification(
        token,
        `${user.username} to "${originalThought}"`,
        message,
        {}
      );
    });
  };

  useEffect(() => {
    getChat();
  }, []);

  const onSendMessage = () => {
    console.log("Sending message: " + message);
    setLoading(true);
    addComment(route.params.id, user.uid, message).then(() => {
      // Make sure we don't send a push notification if the user replies to their own post!
      if (creatorID != user.uid) {
        getUser(creatorID).then((creator) => {
          if (
            creator.data().notificationToken != "" &&
            creator.data().notificationToken != undefined
          ) {
            sendPushNotification(
              creator.data().notificationToken,
              `${user.username} to "${originalThought}"`,
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
            reactionDoc.data().name.id != creatorID
          ) {
            getUser(reactionDoc.data().name.id).then((userData) => {
              seen.add(userData.data().notificationToken);

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

  const getChat = () => {
    setLoading(true);

    getThought(route.params.id).then((thoughtData) => {
      getThoughtImage(route.params.id).then((imageURL) => {
        getUser(thoughtData.name.id).then((userDoc) => {
          getProfilePicture(thoughtData.name.id).then((profileURL) => {
            const found = data.some(
              (reaction) => reaction.id === thoughtData.id
            );
            if (!found) {
              setData((data) => [
                {
                  id: thoughtData.id,
                  sender: userDoc.id === user.uid ? "self" : "other",
                  username: userDoc.data().username,
                  text: thoughtData.thought,
                  timestamp: calculateTimeDiffFromNow(
                    thoughtData.time.toDate()
                  ),
                  rawTime: thoughtData.time,
                  profileURL: profileURL,
                  imageURL: "",
                },
                ...data,
              ]);

              // If there is an image, add it to the data array as a separate message
              if (imageURL !== "") {
                setData((data) => [
                  {
                    id: thoughtData.id,
                    sender: userDoc.id === user.uid ? "self" : "other",
                    username: userDoc.data().username,
                    text: thoughtData.thought,
                    timestamp: calculateTimeDiffFromNow(
                      thoughtData.time.toDate()
                    ),
                    rawTime: thoughtData.time,
                    profileURL: profileURL,
                    imageURL: imageURL,
                  },
                  ...data,
                ]);
              }

              // Set the creatorID of the thought and the original thought
              setCreatorID(userDoc.id);
              setOriginalThought(thoughtData.thought);
            }
          });
        });
      });
    });

    let itemsProcessed = 0;

    getReactions(route.params.id).then((reactions) => {
      if (reactions.size > 0) {
        reactions.forEach((reactionDoc) => {
          getUser(reactionDoc.data().name.id).then((userDoc) => {
            getProfilePicture(reactionDoc.data().name.id).then((profileURL) => {
              const found = data.some(
                (reaction) => reaction.id === reactionDoc.id
              );
              if (!found) {
                // IMPORTANT: Need to use a function to create a new array since state updates are asynchronous or sometimes batched.
                setData((data) => [
                  {
                    id: reactionDoc.id,
                    sender: userDoc.id === user.uid ? "self" : "other",
                    username: userDoc.data().username,
                    text: reactionDoc.data().text,
                    timestamp: calculateTimeDiffFromNow(
                      reactionDoc.data().time.toDate()
                    ),
                    rawTime: reactionDoc.data().time,
                    profileURL: profileURL,
                    imageURL: "",
                  },
                  ...data,
                ]);

                itemsProcessed++;
                if (itemsProcessed === reactions.size) {
                  setLoading(false);
                }
              } else {
                itemsProcessed++;
                if (itemsProcessed === reactions.size) {
                  setLoading(false);
                }
              }
            });
          });
        });
      } else {
        setLoading(false);
      }
    });
  };

  // Function to render messages
  const renderMessages = () => {
    const messages = data.sort((a, b) => a.rawTime - b.rawTime);
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
            <View
              key={index}
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
          );
        } else if (
          index != 0 &&
          messages[index - 1].sender === "other" &&
          messages[index - 1].username === message.username &&
          messages[index + 1].username === message.username
        ) {
          // This is for the middle messages from the user
          return (
            <View
              key={index}
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
          );
        } else if (
          index != messages.length - 1 &&
          messages[index + 1].sender === "other" &&
          messages[index + 1].username === message.username
        ) {
          // This is the start of a group of messages from the user
          return (
            <View
              key={index}
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
          );
        } else {
          // This is for a single message from a user
          return (
            <View
              key={index}
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
          );
        }
      } else {
        // This is for messages sent by the user itself
        return (
          <View
            key={index}
            style={{
              flexDirection: "row",
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
          {renderMessages()}
        </ScrollView>
        <View style={styles.inputView}>
          <TextInput
            style={styles.input}
            placeholder="Message"
            value={message}
            onChangeText={(text) => {
              setMessage(text);
            }}
          />
          <TouchableOpacity onPress={onSendMessage}>
            <Image style={styles.send} source={require("../assets/send.png")} />
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
    alignSelf: "center",
    // Breaking the system!
    width: 300,
    height: 300,
    borderRadius: 15,
    borderColor: colors.gray_2,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    resizeMode: "contain",
  },
  inputView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    width: "90%",
  },
  input: {
    flex: 1,
    backgroundColor: colors.almost_white,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: "Nunito-Regular",
    fontSize: 16,
  },
  send: {
    width: 24,
    height: 21.2,
    marginLeft: 16,
  },
});

export default SingleChatScreen;