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
  getThought,
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

// Function to grab data for a specific thoughtUID
export async function getThoughtData(thoughtUID) {
  try {
    return new Promise((resolve, reject) => {
      getThought(thoughtUID).then((thought) => {
        getLastInteractionOfThoughts([thought]).then((lastInteractions) => {
          getUsersOfThoughts([thought]).then((users) => {
            getProfilePicturesOfUsers(users).then((profileURLs) => {
              getImagesOfThoughts([thought]).then((imageURLs) => {
                getCollabsOfThoughts([thought]).then((thoughtCollabs) => {
                  getEmojisSizeOfThoughts([thought]).then((emojiSizes) => {
                    getReactionsSizeOfThoughts([thought]).then(
                      (reactionSizes) => {
                        const docData = thought;
                        const user = users[0];
                        const collabs = thoughtCollabs[0].map(
                          (user) => user.data().name.split(" ")[0]
                        );
                        const imageURL = imageURLs[0];
                        const profileURL = profileURLs[0];
                        const lastInteraction = lastInteractions[0];

                        resolve({
                          id: docData.id,
                          creatorID: user.id,
                          name: user.data().username,
                          imageURL: imageURL,
                          profileURL: profileURL,
                          time: calculateTimeDiffFromNow(docData.time.toDate()),
                          rawTime: lastInteraction,
                          postTime: docData.time.toDate(),
                          collabs: collabs,
                          emojis: emojiSizes[0],
                          reactions: reactionSizes[0],
                          thoughtUID: docData.id,
                          thought: docData.thought,
                        });
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
  } catch (error) {
    console.log(error);
  }
}
