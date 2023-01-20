import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Keyboard,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Animated,
} from "react-native";
import colors from "../assets/colors";

const Think = ({ swiped }) => {
  // TODO: disable keyboard when the bottom sheet is deactivated (currently can click on the "hidden" component and keyboard will come up)
  const [thought, setThought] = useState("");
  const audioStyle = useAudioStyle(thought);

  const [textContainerBottom, setTextContainerBottom] = useState(
    new Animated.Value(0)
  );

  const [keyboardDidShowListener, setKeyboardDidShowListener] = useState(null);

  useEffect(() => {
    if (swiped) {
      inputRef.current.focus();
    } else {
      inputRef.current.clear();
      Keyboard.dismiss();
    }
    const keyboardDidShow = (event) => {
      const { endCoordinates } = event;
      const spacing = endCoordinates.height + 12;
      setTextContainerBottom(spacing);
    };
    setKeyboardDidShowListener(
      Keyboard.addListener("keyboardDidShow", keyboardDidShow)
    );
    return () => {
      if (keyboardDidShowListener) keyboardDidShowListener.remove();
    };
  }, [swiped]);

  const inputRef = React.createRef();

  const onSubmit = () => {
    console.log("about to submit ", thought);
  };

  const hide = {
    opacity: swiped ? 1 : 0,
  };

  return (
    <View style={[styles.thinkContainer, hide]}>
      <TextInput
        ref={inputRef}
        autoFocus={swiped}
        style={styles.input}
        multiline={true}
        textAlign="left"
        selectionColor={colors.primary_4}
        placeholderTextColor={colors.gray_3}
        placeholder="What you thinking about? Keep it raw. Develop it as you go!"
        value={thought}
        onChangeText={(text) => setThought(text)}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View
          style={{
            position: "absolute",
            bottom: textContainerBottom,
            alignSelf: "center",
          }}
        >
          <Image
            style={[styles.audio, audioStyle]}
            source={require("../assets/audio.png")}
            //   source={{uri: props.img}}
            //   resizeMode="stretch"
          />
          <TouchableOpacity onPress={onSubmit}>
            <Text style={styles.think}>Think</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

const useAudioStyle = (thought) => {
  return {
    opacity: thought.length > 0 ? 0 : 1,
  };
};

const styles = StyleSheet.create({
  thinkContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  input: {
    color: colors.primary_9,
    fontFamily: "Nunito-Medium",
    fontSize: 20,
    // This doesn't seem right...?
    marginHorizontal: 24,
  },
  audio: {
    width: 20,
    height: 30,
    alignSelf: "center",
    marginBottom: 16,
  },
  think: {
    color: colors.almost_white,
    fontFamily: "Nunito-SemiBold",
    fontSize: 16,
    overflow: "hidden",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.primary_5,
    margin: 0,
  },
});

export default Think;
