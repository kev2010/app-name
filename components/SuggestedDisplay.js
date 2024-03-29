import {
  StyleSheet,
  FlatList,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { userState } from "../globalState";
import colors from "../assets/colors";
import * as Contacts from "expo-contacts";
import { countryCodes } from "../assets/countryCodes";
import {
  getMultipleUsersByPhoneNumbers,
  getProfilePicture,
  sendFriendRequest,
  getTopUsers,
} from "../api";
import SuggestedElement from "./SuggestedElement";

const SuggestedDisplay = () => {
  const [user, setUser] = useRecoilState(userState);
  const [suggestions, setSuggestions] = useState([]);
  const [mutuals, setMutuals] = useState([]);
  const [layout, setLayout] = useState({
    width: 0,
    height: 0,
  });
  const [loading, setLoading] = useState(false);

  // TODO: Duplicate function everywhere - maybe put in helpers.js
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

  const getPhoneNumberList = (data) => {
    return data
      .map((contact) => contact.phoneNumbers)
      .filter((phoneNumberArray) => phoneNumberArray != undefined)
      .map((phoneNumberArray) => {
        const result = [];
        phoneNumberArray.forEach((phoneNumberObject) => {
          // Just taking the first country code because I'm lazy
          result.push(
            phoneNumberObject.digits[0] === "+"
              ? phoneNumberObject.digits
              : "+" +
                  countryCodes[phoneNumberObject.countryCode.toUpperCase()]
                    .callingCode[0] +
                  phoneNumberObject.digits
          );
        });
        return result;
      })
      .flat();
  };

  useEffect(() => {
    // setLoading(true);
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });

        if (data.length > 0) {
          // This is quite a nasty process - the reason for a bunch of itemsProcessed is to know when exactly to call setLoading(false)
          const phoneNumberList = getPhoneNumberList(data);
          getMultipleUsersByPhoneNumbers(phoneNumberList).then((usersData) => {
            let itemsProcessed = 0;
            usersData.forEach((document) => {
              if (document != null) {
                const isCurrentUser = user.uid === document.id;
                const isFriend = user.friends.some(
                  (friend) => friend === document.id
                );
                const isFriendRequest = user.friendRequests.some(
                  (request) => request === document.id
                );
                const isSentRequest = user.sentRequests.some(
                  (sent) => sent === document.id
                );

                if (
                  !isCurrentUser &&
                  !isFriend &&
                  !isFriendRequest &&
                  !isSentRequest
                ) {
                  getProfilePicture(document.id).then((profileImage) => {
                    setSuggestions((suggestions) =>
                      [
                        ...suggestions,
                        {
                          name: document.data().name,
                          username: document.data().username,
                          notificationToken: document.data().notificationToken,
                          uid: document.id,
                          imageURL: profileImage,
                          type: "phone",
                        },
                      ].reduce((unique, o) => {
                        if (!unique.some((obj) => obj.uid === o.uid)) {
                          unique.push(o);
                        }
                        return unique;
                      }, [])
                    );
                  });
                }
              }
            });
          });
        }
      }
    })();
  }, []);

  useEffect(() => {
    setLoading(true);
    getTopUsers(user.uid, user.friends).then((usersData) => {
      setMutuals(
        usersData.map((obj) => {
          return {
            name: obj.user.data().name,
            username: obj.user.data().username,
            uid: obj.user.id,
            notificationToken: obj.user.data().notificationToken,
            imageURL: obj.user.data().photoURL,
            mutuals: obj.mutualFriends,
            type: "mutual",
          };
        })
      );
      setLoading(false);
    });
  }, []);

  return loading ? (
    <ActivityIndicator
      style={{ height: "50%" }}
      size="large"
      color={colors.primary_5}
    />
  ) : suggestions.length + mutuals.length > 0 ? (
    <FlatList
      onLayout={(event) => setLayout(event.nativeEvent.layout)}
      showsVerticalScrollIndicator={false}
      data={[...suggestions, ...mutuals].reduce((unique, o) => {
        if (!unique.some((obj) => obj.uid === o.uid)) {
          unique.push(o);
        }
        return unique;
      }, [])}
      renderItem={({ item }) => (
        <View onStartShouldSetResponder={() => true}>
          <SuggestedElement
            name={item.name}
            username={item.username}
            uid={item.uid}
            notificationToken={item.notificationToken}
            imageURL={item.imageURL}
            addFriend={addUserAsFriend}
            sent={user.sentRequests}
            layout={layout}
            type={item.type}
            mutuals={item.type === "phone" ? 0 : item.mutuals}
          />
        </View>
      )}
      keyExtractor={(item) => item.uid}
    />
  ) : (
    <View style={styles.empty}>
      <Text style={styles.emoji}>🫠</Text>
      <Text style={styles.subtitle}>No suggestions yet!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  empty: {
    flexDirection: "column",
    alignItems: "center",
  },
  emoji: {
    fontSize: 48,
  },
  subtitle: {
    color: colors.gray_5,
    fontFamily: "Nunito-SemiBold",
    fontSize: 20,
  },
});

export default SuggestedDisplay;
