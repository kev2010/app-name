import React, { useState, useEffect } from "react";
import { TouchableOpacity, Text, Image, View, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import colors from "../assets/colors";

const UploadImage = ({ image, updateImage }) => {
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.2,
    });

    if (!result.canceled) {
      updateImage(result);
    }
  };

  const removeImage = () => {
    updateImage(null);
  };

  return (
    <View style={styles.container}>
      {!image && (
        <TouchableOpacity onPress={pickImage}>
          <Image
            style={styles.camera}
            source={require("../assets/camera.png")}
          />
        </TouchableOpacity>
      )}
      {image && (
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={pickImage}>
            <Image source={{ uri: image.assets[0].uri }} style={styles.image} />
          </TouchableOpacity>
          <TouchableOpacity onPress={removeImage} style={styles.deleteButton}>
            <Image
              style={styles.delete}
              source={require("../assets/delete.png")}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    alignItems: "flex-end",
    flexDirection: "row",
    marginRight: 12,
    marginLeft: 24,
  },
  camera: {
    width: 24,
    height: 21,
    marginBottom: 4,
  },
  image: {
    width: 60,
    height: 48,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    marginLeft: 8,
    marginBottom: 0,
  },
  deleteButton: {
    position: "absolute",
    top: 0,
    // left: 4,
  },
  delete: {
    width: 24,
    height: 24,
    borderRadius: 50,
    backgroundColor: colors.almost_white,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
});

export default UploadImage;
