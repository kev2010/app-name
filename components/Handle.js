import { Image, Animated } from "react-native";
import React, { useEffect } from "react";

const chevron = require("../assets/handleIndicator.png");

const Handle = ({ swiped, animatedIndex, animatedPosition }) => {
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
    console.log("handle", swiped);

    Animated.timing(rotate, {
      toValue: swiped ? 180 : 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [swiped]);

  return <Animated.Image source={chevron} style={imageStyle} />;

  //   return (
  //     <Image
  //       source={chevron}
  //       style={{
  //         transform: [
  //           {
  //             rotate: swiped ? "180deg" : "0deg",
  //           },
  //         ],
  //         width: 32,
  //         height: 18,
  //         marginTop: 12,
  //         marginBottom: 16,
  //         alignSelf: "center",
  //       }}
  //     />
  //   );
};

export default Handle;
