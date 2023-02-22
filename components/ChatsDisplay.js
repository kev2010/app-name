import { FlatList, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import ChatElement from "./ChatElement";
import {
  getUser,
  getRecentReaction,
  getProfilePicture,
  getUserAllChats,
} from "../api";
import { useRecoilState } from "recoil";
import { userState, feedDataState } from "../globalState";
import colors from "../assets/colors";

const ChatsDisplay = () => {
  const [user, setUser] = useRecoilState(userState);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedData, setFeedData] = useRecoilState(feedDataState);

  const getChatsInfo = () => {
    setLoading(true);
    let itemsProcessed = 0;
    getUserAllChats(user.uid).then((chatsArray) => {
      chatsArray.forEach((document) => {
        const found = data.some((chat) => chat.uid === document.id);
        if (!found && document.data().thought != undefined) {
          // TODO: extremely inefficient - grabbing all images and only displaying 30 of them below
          getProfilePicture(document.data().name.id).then((profileURL) => {
            getRecentReaction(document.id).then((recentReaction) => {
              // TODO: Currently only displaying thoughts that have at least one reaction
              if (recentReaction.length > 0) {
                getUser(recentReaction[0].data().name.id).then(
                  (reactionUser) => {
                    setData((data) => [
                      ...data,
                      {
                        uid: document.id,
                        thought: document.data().thought,
                        lastInteraction: document.data().lastInteraction,
                        profileURL: profileURL,
                        username: reactionUser.data().username,
                        text: recentReaction[0].data().text,
                      },
                    ]);
                    itemsProcessed++;
                    if (itemsProcessed === chatsArray.length) {
                      setLoading(false);
                    }
                  }
                );
              } else {
                itemsProcessed++;
                if (itemsProcessed === chatsArray.length) {
                  setLoading(false);
                }
              }
            });
          });
        } else {
          itemsProcessed++;
          if (itemsProcessed === chatsArray.length) {
            setLoading(false);
          }
        }
      });
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
            // <TouchableOpacity
            //   key={index.toString()}
            //   onPress={() => {
            //     const itemData = Object.values(feedData).filter((thoughtData) => {
            //       return thoughtData.id === item.uid;
            //     });
            //     navigation.navigate("Reactions", {
            //       creatorID: itemData.creatorID,
            //       id: itemData.uid,
            //       imageURL: itemData.imageURL,
            //       profileURL: itemData.profileURL,
            //       name: itemData.name,
            //       time: itemData.time,
            //       collabs: itemData.collabs,
            //       emojis: itemData.emojis,
            //       reactions: itemData.reactions,
            //       thoughtUID: itemData.thoughtUID,
            //       thought: itemData.thought,
            //     });
            //   }}
            //   disabled={
            //     // uid === item.creatorID || !checkIfTodayCycle(item.postTime)
            //     uid === item.creatorID ? false : locked
            //   }
            // >
            <ChatElement
              index={index === 0 ? 0 : index === data.length - 1 ? -1 : index}
              thought={item.thought}
              lastInteraction={item.lastInteraction}
              profileURL={item.profileURL}
              username={item.username}
              text={item.text}
            />
            // </TouchableOpacity>
          )}
          keyExtractor={(item) => item.uid}
        />
      )}
    </>
  );
};

export default ChatsDisplay;
