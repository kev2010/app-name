import {
  getUser,
  getThoughts,
  getLastInteractionOfThoughts,
  getUsersOfThoughts,
  getProfilePicturesOfUsers,
  getCollabsOfThoughts,
  getReactionsSizeOfThoughts,
  getEmojisSizeOfThoughts,
  getImagesOfThoughts,
} from "./api";
import { calculateTimeDiffFromNow } from "./helpers";

// TODO: there are definitely other logic functions that should be extracted from components and placed in this file

export async function refreshFeed(uid) {
  try {
    return new Promise((resolve, reject) => {
      getUser(uid).then((currentUser) => {
        getThoughts(currentUser).then((thoughts) => {
          getLastInteractionOfThoughts(thoughts).then((lastInteractions) => {
            getUsersOfThoughts(thoughts).then((users) => {
              getProfilePicturesOfUsers(users).then((profileURLs) => {
                getImagesOfThoughts(thoughts).then((imageURLs) => {
                  getCollabsOfThoughts(thoughts).then((thoughtCollabs) => {
                    getEmojisSizeOfThoughts(thoughts).then((emojiSizes) => {
                      getReactionsSizeOfThoughts(thoughts).then(
                        (reactionSizes) => {
                          // thoughtCollabs = [[obj1, obj2], [obj3], ...]
                          var data = {};
                          for (var i = 0; i < thoughts.length; i++) {
                            const docData = thoughts[i];
                            const user = users[i];
                            // Grab first name of each collaborator
                            const collabs = thoughtCollabs[i].map(
                              (user) => user.data().name.split(" ")[0]
                            );
                            const imageURL = imageURLs[i];
                            const profileURL = profileURLs[i];
                            const lastInteraction = lastInteractions[i];

                            data[docData.id] = {
                              id: docData.id,
                              creatorID: user.id,
                              name: user.data().username,
                              imageURL: imageURL,
                              profileURL: profileURL,
                              time: calculateTimeDiffFromNow(
                                docData.time.toDate()
                              ),
                              // TODO: For some reason, the image loading puts things out of order
                              rawTime: lastInteraction,
                              postTime: docData.time.toDate(),
                              collabs: collabs,
                              emojis: emojiSizes[i],
                              reactions: reactionSizes[i],
                              thoughtUID: docData.id,
                              thought: docData.thought,
                            };
                          }
                          resolve(data);
                        }
                      );
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  } catch (error) {
    console.log(error);
  }
}
