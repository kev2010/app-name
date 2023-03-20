import { FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import ChatElement from "./ChatElement";
import {
  getUser,
  getRecentReaction,
  getProfilePicture,
  getUserAllChats,
  getParticipants,
} from "../api";
import { useRecoilState } from "recoil";
import { userState, feedDataState } from "../globalState";
import colors from "../assets/colors";

const ChatsDisplay = ({ navigation }) => {
  const [user, setUser] = useRecoilState(userState);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const updateData = (newData, currentData) => {
    const updatedData = currentData.map((item) => {
      const newItem = newData.find((newItem) => newItem.uid === item.uid);
      return newItem ? newItem : item;
    });

    // Add any new items that are not in the current data
    newData.forEach((newItem) => {
      if (!currentData.some((item) => item.uid === newItem.uid)) {
        updatedData.push(newItem);
      }
    });

    return updatedData;
  };

  const getChatsInfo = () => {
    console.log("getChatsInfo Called");
    setLoading(true);

    const unsubscribe = getUserAllChats(user.uid, (chatsArray) => {
      let itemsProcessed = 0;
      // setData([]);
      if (chatsArray.length === 0) {
        setLoading(false);
      }
      let newData = [...data];

      chatsArray.forEach((document) => {
        const found = newData.some((chat) => chat.uid === document.id);
        if (!found && document.data().thought != undefined) {
          // ...

          getRecentReaction(document.id).then((recentReaction) => {
            // ...

            if (recentReaction.length > 0) {
              getParticipants(document.id).then((participants) => {
                getUser(recentReaction[0].data().name.id).then(
                  (reactionUser) => {
                    getProfilePicture(reactionUser.id).then((profileURL) => {
                      newData.push({
                        uid: document.id,
                        thought: document.data().thought,
                        lastInteraction: document.data().lastInteraction,
                        profileURL: profileURL,
                        participants: participants,
                        username: reactionUser.data().username,
                        text: recentReaction[0].data().text,
                      });

                      itemsProcessed++;
                      if (itemsProcessed === chatsArray.length) {
                        setData((currentData) =>
                          updateData(newData, currentData)
                        );
                        setLoading(false);
                      }
                    });
                  }
                );
              });
            } else {
              itemsProcessed++;
              if (itemsProcessed === chatsArray.length) {
                setData((currentData) => updateData(newData, currentData));
                setLoading(false);
              }
            }
          });
        } else {
          itemsProcessed++;
          if (itemsProcessed === chatsArray.length) {
            setData((currentData) => updateData(newData, currentData));
            setLoading(false);
          }
        }
      });

      //   chatsArray.forEach((document) => {
      //     console.log("LOOKING AT ", document.id);
      //     const found = data.some((chat) => chat.uid === document.id);
      //     if (!found && document.data().thought != undefined) {
      //       // TODO: extremely inefficient - grabbing all images and only displaying 30 of them below
      //       getRecentReaction(document.id).then((recentReaction) => {
      //         // getProfilePicture(document.data().name.id).then((profileURL) => {
      //         // TODO: Currently only displaying thoughts that have at least one reaction
      //         if (recentReaction.length > 0) {
      //           getParticipants(document.id).then((participants) => {
      //             getUser(recentReaction[0].data().name.id).then(
      //               (reactionUser) => {
      //                 getProfilePicture(reactionUser.id).then((profileURL) => {
      //                   setData((data) => [
      //                     ...data,
      //                     {
      //                       uid: document.id,
      //                       thought: document.data().thought,
      //                       lastInteraction: document.data().lastInteraction,
      //                       profileURL: profileURL,
      //                       participants: participants,
      //                       username: reactionUser.data().username,
      //                       text: recentReaction[0].data().text,
      //                     },
      //                   ]);
      //                   itemsProcessed++;
      //                   if (itemsProcessed === chatsArray.length) {
      //                     setLoading(false);
      //                   }
      //                 });
      //               }
      //             );
      //           });
      //         } else {
      //           itemsProcessed++;
      //           if (itemsProcessed === chatsArray.length) {
      //             setLoading(false);
      //           }
      //         }
      //         // });
      //       });
      //     } else {
      //       itemsProcessed++;
      //       if (itemsProcessed === chatsArray.length) {
      //         setLoading(false);
      //       }
      //     }
      //   });
    });
  };

  useEffect(() => {
    getChatsInfo();
  }, []);

  return (
    <>
      {loading ? (
        <ActivityIndicator
          style={{ height: "50%" }}
          size="large"
          color={colors.primary_5}
        />
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          // TODO: make more performant - rn i'm loading everything, then just displaying 30 of them??
          data={
            data.sort(function (x, y) {
              return y.lastInteraction - x.lastInteraction;
            })
            // .slice(0, 10)
          }
          renderItem={({ item, index }) => (
            <TouchableOpacity
              key={index.toString()}
              onPress={async () => {
                navigation.navigate("Reactions", {
                  id: item.uid,
                });
              }}
            >
              <ChatElement
                index={index === 0 ? 0 : index === data.length - 1 ? -1 : index}
                thought={item.thought}
                lastInteraction={item.lastInteraction}
                profileURL={item.profileURL}
                participants={item.participants}
                currentUser={user.username}
                username={item.username}
                text={item.text}
              />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.uid}
        />
      )}
    </>
  );
};

const areEqual = (prevProps, nextProps) => {
  // Compare the relevant props for your component
  // Return true if they are equal, false otherwise
  return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
};

export default ChatsDisplay;
