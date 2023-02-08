import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import colors from "../assets/colors";

const OutsideUserElement = ({
  name,
  username,
  uid,
  imageURL,
  addFriend,
  sent,
  layout,
}) => {
  const [loading, setLoading] = useState(false);
  const onAdd = () => {
    setLoading(true);
    addFriend(uid).then(() => {
      setLoading(false);
    });
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
          source={
            imageURL != ""
              ? { uri: imageURL }
              : require("../assets/default.jpeg")
          }
        />
        <View style={styles.information}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.username}>{username}</Text>
        </View>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary_5} />
      ) : sent.indexOf(uid) === -1 ? (
        <TouchableOpacity onPress={onAdd}>
          <Text style={styles.add}>Add</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.sent}>Sent</Text>
      )}
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
  add: {
    color: colors.gray_7,
    fontFamily: "Nunito-SemiBold",
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 10,
    borderColor: colors.gray_5,
    borderWidth: 1,
  },
  sent: {
    color: colors.gray_3,
    fontFamily: "Nunito-SemiBold",
    fontSize: 14,
  },
});

export default OutsideUserElement;
