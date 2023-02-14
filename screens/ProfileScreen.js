import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import colors from "../assets/colors";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";
import OutsideUserElement from "../components/OutsideUserElement.js";
import { getUser, sendFriendRequest, getProfilePicture } from "../api";

const ProfileScreen = ({ navigation, route }) => {
  const [user, setUser] = useRecoilState(userState);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [layout, setLayout] = useState({
    width: 0,
    height: 0,
  });
  const [loading, setLoading] = useState(true);

  const getProfile = () => {
    setLoading(true);
    getUser(route.params.creatorID).then((profile) => {
      getProfilePicture(route.params.creatorID).then((imageURL) => {
        setName(profile.data().name);
        setUsername(profile.data().username);
        setImageURL(imageURL);
        setLoading(false);
      });
    });
  };

  const addUserAsFriend = (friendUID) => {
    return new Promise((resolve, reject) => {
      // Push friend request to everywhere only if it doesn't exist yet
      if (user.friendRequests.indexOf(friendUID) === -1) {
        sendFriendRequest(user.uid, friendUID).then(() => {
          // Update global user state to show that user sent a friend request
          setUser((user) => ({
            ...user,
            sentRequests: [...new Set([...user.sentRequests, friendUID])],
          }));
          resolve(true);
        });
      }
    });
  };

  useEffect(() => {
    getProfile();
  }, []);

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={styles.header}
        onLayout={(event) => setLayout(event.nativeEvent.layout)}
      >
        <Text style={styles.title}>Profile</Text>
        <View style={styles.top}>
          <TouchableOpacity onPress={goBack} style={styles.button}>
            <Image style={styles.back} source={require("../assets/back.png")} />
          </TouchableOpacity>
        </View>
      </View>

      {user.friends.indexOf(route.params.creatorID) === -1 ? (
        <OutsideUserElement
          name={name}
          username={username}
          uid={route.params.creatorID}
          imageURL={imageURL}
          addFriend={addUserAsFriend}
          sent={user.sentRequests}
          layout={layout}
        />
      ) : (
        <View
          style={[
            styles.cell,
            {
              width: layout.width,
            },
          ]}
        >
          <View style={styles.left}>
            {loading ? (
              <ActivityIndicator
                size="small"
                color={colors.primary_5}
                style={styles.loading}
              />
            ) : (
              <Image
                style={styles.profileImage}
                source={
                  imageURL != ""
                    ? { uri: imageURL }
                    : require("../assets/default.jpeg")
                }
              />
            )}
            <View style={styles.information}>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.username}>{username}</Text>
            </View>
          </View>
          <Text style={styles.friend}>Your Friend!</Text>
        </View>
      )}
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
    marginBottom: 32,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    // backgroundColor: "pink",
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
  cell: {
    justifyContent: "space-between",
    flexDirection: "row",
  },
  left: {
    flexDirection: "row",
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 100,
    marginRight: 8,
  },
  information: {
    flexDirection: "column",
    justifyContent: "center",
  },
  name: {
    color: colors.gray_9,
    fontFamily: "Nunito-SemiBold",
    fontSize: 14,
  },
  username: {
    color: colors.gray_5,
    fontFamily: "Nunito-Regular",
    fontSize: 14,
  },
  friend: {
    alignSelf: "center",
    color: colors.accent1_5,
    fontFamily: "Nunito-SemiBold",
    fontSize: 14,
  },
  loading: {
    width: 48,
    height: 48,
    marginRight: 8,
  },
});

export default ProfileScreen;
