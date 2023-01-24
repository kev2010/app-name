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
  ActivityIndicator,
} from "react-native";
import { useRecoilState } from "recoil";
import { addThought } from "../api";
import colors from "../assets/colors";
import { userState } from "../globalState";

const Think = ({ swiped, submitted }) => {
  // TODO: disable keyboard when the bottom sheet is deactivated (currently can click on the "hidden" component and keyboard will come up)
  const [thought, setThought] = useState("");
  const audioStyle = useAudioStyle(thought);
  const submitStyle = useSubmitStyle(thought);
  const [user, setUser] = useRecoilState(userState);
  const [loading, setLoading] = useState(false);
  const [textContainerBottom, setTextContainerBottom] = useState(
    new Animated.Value(0)
  );
  const thinkStyle = useThinkStyle(textContainerBottom);
  const [disable, setDisable] = useState(true);

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
      const spacing = endCoordinates.height + 16;
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
    setLoading(true);
    addThought(user.uid, thought).then(() => {
      submitted();
      setThought("");
      setLoading(false);
    });
  };

  const hide = {
    opacity: swiped ? 1 : 0,
  };

  const checkLength = (text) => {
    setDisable(text.length === 0);
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
        onChangeText={(text) => {
          setThought(text);
          checkLength(text);
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View style={[thinkStyle]}>
          <Image
            style={[styles.audio, audioStyle]}
            source={require("../assets/audio.png")}
            //   source={{uri: props.img}}
            //   resizeMode="stretch"
          />
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary_5} />
          ) : (
            <TouchableOpacity onPress={onSubmit} disabled={disable}>
              <Text style={[styles.think, submitStyle]}>Think</Text>
            </TouchableOpacity>
          )}
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

const useSubmitStyle = (thought) => {
  return {
    backgroundColor: thought.length > 0 ? colors.primary_5 : colors.primary_2,
  };
};

// Android and iOS have weird behaviors with trying to set buttons right above the keyboard! It looks like Android automatically does it while iOS doesn't
const useThinkStyle = (textContainerBottom) => {
  if (Platform.OS === "ios") {
    return {
      position: "absolute",
      bottom: textContainerBottom,
      alignSelf: "center",
    };
  } else {
    // Android - this assumption might break
    return {
      alignSelf: "center",
      marginBottom: 16,
    };
  }
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
    // Much needed for android - not well documented. See https://github.com/facebook/react-native/issues/13897
    textAlignVertical: "top",
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
    margin: 0,
  },
});

export default Think;
