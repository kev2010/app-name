import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import colors from "../assets/colors";

const InviteElement = ({ last, user, isSelected, onSelect, layout }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: last ? 96 : 12,
        width: layout.width,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={
            user.imageURL != ""
              ? { uri: user.imageURL }
              : require("../assets/default.jpeg")
          }
          style={{ width: 64, height: 64, borderRadius: 32 }}
        />
        <View>
          <Text
            style={{
              marginLeft: 10,
              color: colors.gray_9,
              fontFamily: "Nunito-ExtraBold",
              fontSize: 18,
            }}
          >
            {user.name}
          </Text>
          <Text
            style={{
              marginLeft: 10,
              color: colors.gray_5,
              fontFamily: "Nunito-SemiBold",
              fontSize: 16,
            }}
          >
            {user.username}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={onSelect}>
        <View
          style={{
            height: 32,
            width: 32,
            borderRadius: 16,
            borderWidth: isSelected ? 0 : 1,
            borderColor: colors.gray_3,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isSelected ? colors.accent1_1 : "transparent",
          }}
        >
          {isSelected && (
            <Image
              style={{
                height: 13.844,
                width: 18,
              }}
              source={require("../assets/check.png")}
            />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default InviteElement;
