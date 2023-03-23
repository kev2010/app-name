import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import React, { useState, useEffect } from "react";
import colors from "../assets/colors";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";
import { updateProfilePicture, getUser, updateNotifyReplies } from "../api";

const SettingsScreen = ({ navigation }) => {
  const [user, setUser] = useRecoilState(userState);
  const [imageURL, setImageURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  const toggleSwitch = () => {
    updateNotifyReplies(user.uid, !isEnabled).then(() => {
      setIsEnabled((previousState) => !previousState);
    });
  };

  const getNotifyRepliesSetting = async () => {
    return await getUser(user.uid).then(
      (currentUser) => currentUser.data().notifyReplies
    );
  };

  useEffect(() => {
    getNotifyRepliesSetting().then((notifyReplies) => {
      if (notifyReplies === undefined) {
        updateNotifyReplies(user.uid, false);
      } else {
        setIsEnabled(notifyReplies);
      }
    });
  }, []);

  useEffect(() => {
    if (user.imageURL != "" && user.imageURL != null) {
      setImageURL(user.imageURL);
    }
  }, []);

  const goBack = () => {
    navigation.goBack();
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.2,
    });

    if (!result.canceled) {
      setLoading(true);
      updateProfilePicture(user.uid, result).then((downloadURL) => {
        setImageURL(result.assets[0].uri);
        setUser((user) => ({
          ...user,
          imageURL: downloadURL,
        }));
        setLoading(false);
      });
    }
  };

  const onLogOut = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        onPress: () => {
          console.log("CANCELLED");
        },
      },
      {
        text: "Log Out",
        onPress: () => {
          console.log("LOG OUT", user.uid);
          setUser((user) => {
            return {
              ...user,
              username: null,
            };
          });
          navigation.navigate("Name");
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.top}>
          <TouchableOpacity onPress={goBack} style={styles.button}>
            <Image style={styles.back} source={require("../assets/back.png")} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.info}>
        Logged in as {user.name} with username {user.username}
      </Text>

      <View style={styles.switch}>
        <Switch
          trackColor={{ false: colors.gray_9, true: colors.accent1_5 }}
          thumbColor={colors.gray_1}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
        <Text style={styles.notify}>
          Notify me when users reply to a thought I replied to
        </Text>
      </View>

      {loading && (
        <ActivityIndicator
          size="large"
          color={colors.primary_5}
          style={styles.loading}
        />
      )}

      {imageURL === "" && !loading && (
        <Image
          style={styles.profileImage}
          source={require("../assets/default.jpeg")}
        />
      )}
      {imageURL != "" && !loading && (
        <Image style={styles.profileImage} source={{ uri: imageURL }} />
      )}

      <TouchableOpacity onPress={pickImage} style={styles.actions}>
        <Text style={styles.changeProfile}>Change Profile Picture</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onLogOut} style={styles.actions}>
        <Text style={styles.logOut}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray_1,
    alignItems: "center",
    paddingTop: 24,
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginTop: 4,
    width: "90%",
  },
  info: {
    fontFamily: "Nunito-Bold",
    justifyContent: "center",
    textAlign: "center",
    fontSize: 16,
    color: colors.primary_9,
    marginTop: 24,
    alignSelf: "center",
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    position: "absolute",
  },
  title: {
    color: colors.primary_5,
    fontFamily: "Nunito-Bold",
    fontSize: 24,
    justifyContent: "center",
  },
  button: {
    paddingRight: 16,
    paddingBottom: 16,
  },
  back: {
    width: 10.85,
    height: 18.95,
    alignSelf: "center",
    // TODO: Arbitrary numbers????
    marginLeft: 4,
    marginTop: 6,
  },
  switch: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    width: "70%",
    justifyContent: "center",
  },
  notify: {
    marginLeft: 16,
    fontFamily: "Nunito-Regular",
    // textAlign: "center",
    fontSize: 16,
    color: colors.primary_9,
  },
  loading: {
    height: 192 + 64,
  },
  profileImage: {
    width: 192,
    height: 192,
    borderRadius: 100,
    marginVertical: 32,
  },
  changeProfile: {
    fontFamily: "Nunito-SemiBold",
    fontSize: 18,
    overflow: "hidden",
    borderRadius: 10,
    paddingVertical: 12,
    margin: 0,
    backgroundColor: colors.accent1_1,
    color: colors.accent1_5,
    textAlign: "center",
  },
  logOut: {
    fontFamily: "Nunito-SemiBold",
    fontSize: 18,
    overflow: "hidden",
    borderRadius: 10,
    paddingVertical: 12,
    margin: 0,
    marginTop: 16,
    backgroundColor: colors.primary_1,
    color: colors.primary_5,
    textAlign: "center",
  },
  actions: {
    width: "70%",
  },
});

export default SettingsScreen;
