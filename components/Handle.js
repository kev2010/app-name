import { Image, Animated } from "react-native";
import React, { useEffect } from "react";

const Handle = (props) => {
  const rotate = new Animated.Value(props.swiped ? 180 : 0);

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
    console.log("handle", props.swiped);

    Animated.timing(rotate, {
      toValue: props.swiped ? 180 : 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [props.swiped]);

  return (
    <Animated.Image
      source={require("../assets/handleIndicator.png")}
      style={imageStyle}
    />
  );
};

export default Handle;
