import React, { useState } from "react";
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

const RequestElement = ({
  name,
  username,
  uid,
  acceptRequest,
  rejectRequest,
  layout,
}) => {
  const [loading, setLoading] = useState(false);
  const onAccept = () => {
    setLoading(true);
    acceptRequest(uid).then(() => {
      setLoading(false);
    });
  };

  const onReject = () => {
    Alert.alert(
      "Confirm Remove Friend Request",
      `Are you sure you want to reject ${name}'s friend request? ${name} will not be notified.`,
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
            console.log("REMOVE", uid);
            rejectRequest(uid);
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: layout.width,
        },
      ]}
    >
      <View style={styles.left}>
        <Image
          style={styles.profileImage}
          source={require("../assets/fbprofile.jpg")}
        />
        <View style={styles.information}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.username}>{username}</Text>
        </View>
      </View>
      <View style={styles.buttons}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.accent1_5} />
        ) : (
          <TouchableOpacity onPress={onAccept}>
            <Text style={styles.accept}>Accept</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onReject} style={styles.smallTouchable}>
          <Image
            style={styles.reject}
            source={require("../assets/reject.png")}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  left: {
    flexDirection: "row",
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 100,
    marginRight: 8,
  },
  information: {
    flexDirection: "column",
    justifyContent: "center",
  },
  name: {
    color: colors.gray_9,
    fontFamily: "Nunito-SemiBold",
    fontSize: 14,
  },
  username: {
    color: colors.gray_5,
    fontFamily: "Nunito-Regular",
    fontSize: 14,
  },
  buttons: {
    flexDirection: "row",
    alignItems: "center",
  },
  accept: {
    backgroundColor: colors.accent1_1,
    color: colors.accent1_8,
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 10,
    borderColor: colors.accent1_3,
    borderWidth: 1,
    overflow: "hidden",
  },
  smallTouchable: {
    backgroundColor: "pink",
    paddingVertical: 8,
  },
  reject: {
    marginLeft: 24,
    width: 12,
    height: 12,
  },
});

export default RequestElement;
