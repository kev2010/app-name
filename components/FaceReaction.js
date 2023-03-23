import { Camera, CameraType } from "expo-camera";
import { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { uploadFaceReactionToThought } from "../api";
import { useRecoilState } from "recoil";
import colors from "../assets/colors";
import { userState } from "../globalState";
import { ActivityIndicator } from "react-native-paper";

const FaceReaction = ({ thoughtUID, goBack }) => {
  const [user, setUser] = useRecoilState(userState);
  const [type, setType] = useState(CameraType.front);
  const [loading, setLoading] = useState(false);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const cameraRef = useRef(null);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  function toggleCameraType() {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  }

  async function captureAndUploadPhoto() {
    if (cameraRef.current) {
      setLoading(true);
      console.log("taking");
      const options = { quality: 0.5, base64: true };
      const photo = await cameraRef.current.takePictureAsync(options);
      console.log("took it!");
      uploadFaceReactionToThought(photo, user.uid, thoughtUID).then(
        (downloadURL) => {
          console.log("downloadURL", downloadURL);
          setLoading(false);
          goBack();
        }
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.circularMask}>
        <Camera style={styles.camera} type={type} ref={cameraRef}></Camera>
      </View>
      <View style={styles.buttonContainer}>
        {/* <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
          <Text style={styles.text}>Flip Camera</Text>
        </TouchableOpacity> */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.almost_white}
            style={styles.loading}
          />
        ) : (
          <TouchableOpacity
            style={styles.outerCircle}
            onPress={captureAndUploadPhoto}
            disabled={loading}
          >
            <View style={styles.innerCircle} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  circularMask: {
    width: 350,
    height: 350,
    borderRadius: 200,
    borderColor: colors.almost_white,
    borderWidth: 5,
    backgroundColor: "purple",
    overflow: "hidden",
    alignSelf: "center",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    backgroundColor: "transparent",
    marginTop: 64,
    marginBottom: "30%",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
  },
  outerCircle: {
    width: 96,
    height: 96,
    borderRadius: 50,
    backgroundColor: colors.almost_white,
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: 84,
    height: 84,
    borderRadius: 50,
    backgroundColor: colors.almost_white,
    borderWidth: 2,
    borderColor: colors.gray_9,
  },
  loading: {
    height: 96,
  },
});

export default FaceReaction;
