import {
  getThoughts,
  getUsersOfThoughts,
  getCollabsOfThoughts,
  getReactionsSizeOfThoughts,
  getImagesOfThoughts,
} from "./api";
import { calculateTimeDiffFromNow } from "./helpers";

// TODO: there are definitely other logic functions that should be extracted from components and placed in this file

export async function refreshFeed(uid) {
  try {
    return new Promise((resolve, reject) => {
      getThoughts(uid).then((thoughts) => {
        getUsersOfThoughts(thoughts).then((users) => {
          getImagesOfThoughts(thoughts).then((imageURLs) => {
            getCollabsOfThoughts(thoughts).then((thoughtCollabs) => {
              getReactionsSizeOfThoughts(thoughts).then((reactionSizes) => {
                // thoughtCollabs = [[obj1, obj2], [obj3], ...]
                var data = {};
                for (var i = 0; i < thoughts.size; i++) {
                  const doc = thoughts.docs[i];
                  const user = users[i];
                  // Grab first name of each collaborator
                  const collabs = thoughtCollabs[i].map(
                    (user) => user.data().name.split(" ")[0]
                  );
                  const imageURL = imageURLs[i];

                  data[doc.id] = {
                    id: doc.id,
                    creatorID: user.id,
                    name: user.data().name,
                    imageURL: imageURL,
                    time: calculateTimeDiffFromNow(doc.data().time.toDate()),
                    collabs: collabs,
                    reactions: reactionSizes[i],
                    thought: doc.data().thought,
                  };
                }
                resolve(data);
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
