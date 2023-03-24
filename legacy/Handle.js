import {
  Image,
  Animated,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useEffect } from "react";

const chevron = require("../assets/handleIndicator.png");

const Handle = ({ swiped, onPress }) => {
  const rotate = new Animated.Value(swiped ? 180 : 0);

  const imageStyle = {
    transform: [
      {
        rotate: rotate.interpolate({
          inputRange: [0, 180],
          outputRange: ["0deg", "180deg"],
        }),
      },
    ],
    width: 32,
    height: 18,
    marginTop: 12,
    marginBottom: 16,
    alignSelf: "center",
    // transition: "transform 0.2s",
  };

  useEffect(() => {
    Animated.timing(rotate, {
      toValue: swiped ? 180 : 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [swiped]);

  return (
    <TouchableOpacity onPress={onPress} style={styles.handleContainer}>
      <Animated.Image source={chevron} style={imageStyle} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  handleContainer: {
    // backgroundColor: "green",
  },
});

export default Handle;
