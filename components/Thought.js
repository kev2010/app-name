import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import colors from "../assets/colors";
import { useRecoilState } from "recoil";
import { userState, feedDataState } from "../globalState";
import Autolink from "react-native-autolink";
import { addEmoji, deleteThought } from "../api";

const Thought = (props) => {
  const [user, setUser] = useRecoilState(userState);
  const [loading, setLoading] = useState(false);
  const [emojiCount, setEmojiCount] = useState(props.emojis);

  let collabsText = "";
  if (props.collabs.length == 1) {
    collabsText = `thought with ${props.collabs[0]}`;
  } else if (props.collabs.length == 2) {
    collabsText = `thought with ${props.collabs[0]} and ${props.collabs[1]}`;
  } else if (props.collabs.length > 2) {
    collabsText = `thought with ${props.collabs[0]}, ${props.collabs[1]}, and more`;
  }

  const goToProfile = () => {
    if (props.creatorID === user.uid) {
      props.navigation.navigate("Settings");
    } else {
      props.navigation.navigate("Profile", {
        creatorID: props.creatorID,
      });
    }
  };

  useEffect(() => {
    setEmojiCount(props.emojis);
  }, [props.emojis]);

  const deleteThoughtAlert = () => {
    Alert.alert(
      "Confirm Delete Thought",
      `Are you sure you want to delete this thought? This cannot be undone!`,
      [
        {
          text: "Cancel",
          onPress: () => {
            console.log("CANCELLED");
          },
        },
        {
          text: "Remove",
          onPress: () => {
            setLoading(true);
            console.log("DELETEE", props.thoughtUID);
            deleteThought(props.thoughtUID).then(() => {
              setLoading(false);
            });
          },
          style: "destructive",
        },
      ]
    );
  };

  const userAddEmoji = () => {
    console.log("ahahaha", props.thoughtUID, user.uid);
    addEmoji(props.thoughtUID, user.uid, "rizz").then(() => {
      setEmojiCount((emojiCount) => emojiCount + 1);
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.row1}>
        <TouchableOpacity style={styles.profile} onPress={goToProfile}>
          <Image
            style={styles.profileImage}
            source={
              props.profileURL != ""
                ? { uri: props.profileURL }
                : require("../assets/default.jpeg")
            }
          />
          <Text style={styles.name}>{props.name}</Text>
          <Text style={styles.time}>{props.time}</Text>
        </TouchableOpacity>
        {props.creatorID == user.uid && props.showTrash ? (
          loading ? (
            <ActivityIndicator
              style={styles.loading}
              // style={{ height: "50%" }}
              size="small"
              color={colors.primary_5}
            />
          ) : (
            <TouchableOpacity style={styles.trash} onPress={deleteThoughtAlert}>
              <Image
                style={styles.trashImage}
                source={require("../assets/trash.png")}
              />
            </TouchableOpacity>
          )
        ) : null}
      </View>
      <View
        style={[
          styles.row2,
          { marginBottom: props.collabs.length > 0 ? 16 : 8 },
        ]}
      >
        {/* See https://github.com/joshswan/react-native-autolink */}
        {props.locked ? (
          <View style={styles.lockedRow}>
            <Image style={styles.lock} source={require("../assets/lock.png")} />
            <Text style={styles.lockedText}>
              Share something interesting or reply to two thoughts to unlock
              your collective’s thoughts today!
            </Text>
          </View>
        ) : (
          <Autolink style={styles.text} text={props.thought} />
        )}
      </View>
      {props.imageURL != "" && !props.locked ? (
        <View style={styles.row3}>
          <Image style={styles.photo} source={{ uri: props.imageURL }} />
        </View>
      ) : null}

      {props.reactions > 0 || collabsText != "" ? (
        <View style={styles.row4}>
          {/* <View style={styles.actions}>
          <TouchableOpacity style={styles.profile} onPress={userAddEmoji}>
            <Image
              style={styles.emojis}
              source={require("../assets/stars.png")}
              //   source={{uri: props.img}}
              // resizeMode="stretch"
            />
          </TouchableOpacity>
          <Text style={styles.number}>{emojiCount}</Text>
        </View> */}
          <Text style={styles.thought}>{collabsText}</Text>
          <View style={styles.actions}>
            {/* <Text style={styles.emojis}>&#10024;</Text> */}
            {props.reactions > 0 ? (
              <>
                <Image
                  style={styles.comments}
                  source={require("../assets/comment.png")}
                  //   source={{uri: props.img}}
                  // resizeMode="stretch"
                />
                <Text style={styles.number}>{props.reactions}</Text>
              </>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // justifyContent: "space-around",
    backgroundColor: colors.almost_white,
    borderRadius: 15,
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
  },
  trash: {
    marginLeft: "auto",
    paddingHorizontal: 6,
    // Needed to keep image on RHS
    marginRight: -6,
    paddingVertical: 6,
  },
  trashImage: {
    width: 16,
    height: 18,
  },
  loading: {
    marginLeft: "auto",
  },
  row1: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  row2: {
    flexDirection: "row",
  },
  row3: {
    flexDirection: "row",
    marginTop: 4,
    marginBottom: 16,
    alignSelf: "center",
    // Breaking the system!
    width: 315,
    height: 315,
    borderRadius: 15,
    borderColor: colors.gray_1,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  row4: {
    justifyContent: "space-between",
    flexDirection: "row",
  },
  photo: {
    width: "100%",
    resizeMode: "contain",
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 100,
    marginRight: 8,
  },
  name: {
    marginRight: 8,
    color: colors.gray_9,
    fontSize: 16,
    fontFamily: "Nunito-ExtraBold",
  },
  time: {
    color: colors.gray_4,
    fontSize: 14,
    fontFamily: "Nunito-Regular",
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.primary_9,
    fontFamily: "Nunito-Regular",
  },
  thought: {
    color: colors.gray_3,
    fontFamily: "Nunito-Bold",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  emojis: {
    width: 14,
    height: 20,
    marginRight: 8,
  },
  comments: {
    width: 14,
    height: 14,
    marginRight: 8,
  },
  number: {
    color: colors.primary_5,
    fontFamily: "Nunito-SemiBold",
  },
  lockedRow: {
    flexDirection: "row",
    width: "100%",
  },
  lock: {
    width: 16,
    height: 21,
    marginRight: 12,
    marginTop: 4,
  },
  lockedText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.gray_3,
    fontFamily: "Nunito-Regular",
    flex: 1,
  },
});

export default Thought;
