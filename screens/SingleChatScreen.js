import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  SafeAreaView,
} from "react-native";
import SingleChatHeader from "../components/SingleChatHeader";
import { useNavigation } from "@react-navigation/native";
import colors from "../assets/colors";
import { getUser, getProfilePicture, getReactions, getEmojis } from "../api";
import { calculateTimeDiffFromNow } from "../helpers";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";

const SingleChatScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useRecoilState(userState);
  const [data, setData] = useState([]);

  // Replace this with actual messages data
  // let messages = [
  //   {
  //     id: 1,
  //     sender: "self",
  //     text: "Hello!",
  //     timestamp: "7m",
  //   },
  //   {
  //     id: 2,
  //     sender: "other",
  //     username: "fionacai",
  //     text: "Is intelligence a surviving trait, at the scale of species? i.e., is an intelligent species more likely to survive over a less intelligent one, all else equal?",
  //     timestamp: "5m",
  //   },
  //   {
  //     id: 3,
  //     sender: "self",
  //     text: "Hi there!",
  //     timestamp: "4m",
  //   },
  //   {
  //     id: 4,
  //     sender: "other",
  //     username: "vbux",
  //     text: "ur an egg waffle",
  //     timestamp: "5m",
  //   },
  //   {
  //     id: 5,
  //     sender: "other",
  //     username: "allenwang314",
  //     text: "Bruh",
  //     timestamp: "2m",
  //   },
  //   {
  //     id: 6,
  //     sender: "other",
  //     username: "allenwang314",
  //     text: "Guess what I just found out? The word 'bruh' is actually an acronym for 'Brother, you are handsome.'",
  //     timestamp: "2m",
  //   },
  //   {
  //     id: 7,
  //     sender: "other",
  //     username: "allenwang314",
  //     text: "I'm not kidding.",
  //     timestamp: "1m",
  //   },
  //   {
  //     id: 8,
  //     sender: "self",
  //     text: "According to the theory of evolution, the answer is yes. The more intelligent species are more likely to survive over a less intelligent one, all else equal.",
  //     timestamp: "1m",
  //   },
  //   {
  //     id: 9,
  //     sender: "self",
  //     text: "Bruh.",
  //     timestamp: "1m",
  //   },
  // ];

  // Function to handle going back to the previous screen
  const goBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    getChat();
  }, []);

  const getChat = () => {
    let itemsProcessed = 0;
    getReactions(route.params.id).then((reactions) => {
      if (reactions.size > 0) {
        reactions.forEach((reactionDoc) => {
          getUser(reactionDoc.data().name.id).then((userDoc) => {
            getProfilePicture(reactionDoc.data().name.id).then((imageURL) => {
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
                    imageURL: imageURL,
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
                  message.imageURL != ""
                    ? { uri: message.imageURL }
                    : require("../assets/default.jpeg")
                }
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  marginRight: 8,
                }}
              />
              <View style={{ maxWidth: "82%", alignItems: "flex-start" }}>
                <View style={styles.otherTextBubble}>
                  <Text style={styles.otherText}>{message.text}</Text>
                </View>
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
              <View style={{ maxWidth: "82%", alignItems: "flex-start" }}>
                <View style={styles.otherTextBubble}>
                  <Text style={styles.otherText}>{message.text}</Text>
                </View>
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
              <View style={{ maxWidth: "82%", alignItems: "flex-start" }}>
                <View style={styles.info}>
                  <Text style={styles.username}>{message.username}</Text>
                  <Text style={styles.timestamp}>{message.timestamp}</Text>
                </View>
                <View style={styles.otherTextBubble}>
                  <Text style={styles.otherText}>{message.text}</Text>
                </View>
              </View>
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
                  message.imageURL != ""
                    ? { uri: message.imageURL }
                    : require("../assets/default.jpeg")
                }
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  marginRight: 8,
                }}
              />
              <View style={{ maxWidth: "82%", alignItems: "flex-start" }}>
                <View style={styles.info}>
                  <Text style={styles.username}>{message.username}</Text>
                  <Text style={styles.timestamp}>{message.timestamp}</Text>
                </View>
                <View style={styles.otherTextBubble}>
                  <Text style={styles.otherText}>{message.text}</Text>
                </View>
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
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              marginTop: 2,
              marginBottom:
                index != messages.length - 1 &&
                messages[index + 1].sender === "self"
                  ? 0
                  : 12,
            }}
          >
            <View style={{ maxWidth: "85%" }}>
              <View style={styles.userTextBubble}>
                <Text style={styles.userText}>{message.text}</Text>
              </View>
            </View>
          </View>
        );
      }
    });
  };

  return (
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
      <ScrollView style={styles.messages}>{renderMessages()}</ScrollView>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 10,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            backgroundColor: "white",
            borderRadius: 10,
            padding: 10,
          }}
          placeholder="Type a message"
        />
        <TouchableOpacity>
          <Text>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
});

export default SingleChatScreen;
