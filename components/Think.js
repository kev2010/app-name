import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Keyboard,
  TextInput,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";
import UploadImage from "./UploadImage";
import { useRecoilState } from "recoil";
import { addThought, uploadThoughtImage } from "../api";
import colors from "../assets/colors";
import { userState, feedDataState } from "../globalState";
import { CONSTANTS } from "../constants";
import { refreshFeed } from "../logic";

const Think = ({ swiped, submitted }) => {
  // TODO: disable keyboard when the bottom sheet is deactivated (currently can click on the "hidden" component and keyboard will come up)
  // TODO: can't tap to move cursor (have to hold down spacebar) - problem exists for Commenting too I think
  const [thought, setThought] = useState("");
  const audioStyle = useAudioStyle(thought);
  const submitStyle = useSubmitStyle(thought);
  const [user, setUser] = useRecoilState(userState);
  const [loading, setLoading] = useState(false);
  const [textContainerBottom, setTextContainerBottom] = useState(0);
  const bottomStyle = useBottomStyle(textContainerBottom);
  const inputStyle = useInputStyle(textContainerBottom);
  const [disable, setDisable] = useState(true);
  const inputRef = React.createRef();
  const [feedData, setFeedData] = useRecoilState(feedDataState);
  const [keyboardDidShowListener, setKeyboardDidShowListener] = useState(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    // TODO: This is messy, but somehow needed for Android devices to work properly? The keyboard doesn't show up otherwise
    setTimeout(() => {
      if (swiped) {
        // TODO: I don't quite understand why inputRef is ever null? But it throws "TypeError: null is not an object (evaluating 'inputRef.current.focus')" right after login flow
        if (inputRef != null) {
          inputRef.current.focus();
        }
      } else {
        Keyboard.dismiss();
      }
      const keyboardDidShow = (event) => {
        const { endCoordinates } = event;
        const spacing = endCoordinates.height + CONSTANTS.KEYBOARD_OFFSET;
        setTextContainerBottom(spacing);
      };
      setKeyboardDidShowListener(
        Keyboard.addListener("keyboardDidShow", keyboardDidShow)
      );
      return () => {
        if (keyboardDidShowListener) keyboardDidShowListener.remove();
      };
    }, 100);
  }, [swiped]);

  const onSubmit = () => {
    console.log("about to submit ", thought);
    setLoading(true);
    addThought(user.uid, thought).then((docID) => {
      console.log("uploaded the thought!", docID);
      uploadThoughtImage(image, docID).then((downloadURL) => {
        console.log("good news! we're gooD!", downloadURL);
        refreshFeed(user.uid).then((data) => {
          setFeedData(data);
          submitted();
          setThought("");
          setImage(null);
          setLoading(false);
        });
      });
    });
  };

  const hide = {
    opacity: swiped ? 1 : 0,
  };

  const changeThought = (text) => {
    if (text.length <= CONSTANTS.MAX_LENGTH) {
      setThought(text);
    }
  };

  const checkLength = (text) => {
    setDisable(text.length === 0);
  };

  const updateImage = (image) => {
    setImage(image);
  };

  return (
    <View style={[styles.thinkContainer, hide]}>
      <TextInput
        ref={inputRef}
        caretHidden={false}
        scrollEnabled={true}
        autoFocus={swiped}
        style={[styles.input, inputStyle]}
        multiline={true}
        textAlign="left"
        selectionColor={colors.primary_4}
        placeholderTextColor={colors.gray_3}
        placeholder="What you thinking about? Keep it raw. Develop it as you go!"
        value={thought}
        editable={swiped}
        onChangeText={(text) => {
          changeThought(text);
          checkLength(text);
        }}
      />
      <Animated.View style={[styles.controls, bottomStyle]}>
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
      <View style={[styles.options, bottomStyle]}>
        <UploadImage image={image} updateImage={updateImage} />
        <Text style={styles.charCount}>
          {thought.length}/{CONSTANTS.MAX_LENGTH}
        </Text>
      </View>
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
const useBottomStyle = (textContainerBottom) => {
  // On Android, the keyboard adjustment happens automatically
  return {
    bottom:
      Platform.OS === "ios" ? textContainerBottom : CONSTANTS.KEYBOARD_OFFSET,
  };
};

const useInputStyle = (textContainerBottom) => {
  // On Android, the keyboard adjustment happens automatically
  return {
    marginBottom:
      CONSTANTS.INPUT_OFFSET +
      (Platform.OS === "ios" ? textContainerBottom : CONSTANTS.KEYBOARD_OFFSET),
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
    // Much needed for android - not well documented. See https://github.com/facebook/react-native/issues/13897
    textAlignVertical: "top",
  },
  controls: {
    position: "absolute",
    alignSelf: "center",
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
  options: {
    width: "100%",
    position: "absolute",
    alignItems: "flex-end",
    justifyContent: "space-between",
    flexDirection: "row",
    zIndex: -1,
  },
  charCount: {
    color: colors.primary_3,
    fontFamily: "Nunito-Regular",
    fontSize: 12,
    paddingBottom: 4,
    paddingRight: 24,
  },
});

export default Think;
