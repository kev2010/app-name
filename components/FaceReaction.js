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
import { uploadFaceReactionToThought, addFaceReactionToThought } from "../api";
import { useRecoilState } from "recoil";
import colors from "../assets/colors";
import { userState, refreshingState, feedDataState } from "../globalState";
import { ActivityIndicator } from "react-native-paper";
import { refreshFeed } from "../logic";

const FaceReaction = ({ thoughtUID, goBack }) => {
  const [user, setUser] = useRecoilState(userState);
  const [type, setType] = useState(CameraType.front);
  const [feedData, setFeedData] = useRecoilState(feedDataState);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useRecoilState(refreshingState);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const cameraRef = useRef(null);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    } else if (permission && permission.granted === false) {
      requestPermission();
    }
  }, [permission]);

  if (permission && !permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.rejectedContainer}>
        <Text
          style={{
            textAlign: "center",
            color: colors.primary_5,
            fontFamily: "Nunito-SemiBold",
            fontSize: 18,
            padding: 12,
          }}
        >
          To use the camera in the app, please go to your phone settings and
          grant camera permission to App Name.
        </Text>
      </View>
    );
  }

  async function captureAndUploadPhoto() {
    if (cameraRef.current) {
      setLoading(true);
      const options = { quality: 0.5, base64: true };
      const photo = await cameraRef.current.takePictureAsync(options);
      uploadFaceReactionToThought(photo, user.uid, thoughtUID).then(
        (downloadURL) => {
          addFaceReactionToThought(user.username, thoughtUID, downloadURL).then(
            () => {
              setRefreshing(true);
              refreshFeed(user.uid).then((data) => {
                setFeedData(data);
                setRefreshing(false);
              });
            }
          );
          setLoading(false);
          goBack();
        }
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.circularMask}>
        <Camera style={styles.camera} type={type} ref={cameraRef} />
      </View>
      <View style={styles.buttonContainer}>
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
  rejectedContainer: {
    // flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    width: "85%",
    backgroundColor: colors.primary_1,
    borderRadius: 15,
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
