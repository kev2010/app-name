import { getUser, getThoughts } from "./api";
import { calculateTimeDiffFromNow } from "./helpers";

// TODO: there are definitely other logic functions that should be extracted from components and placed in this file
export async function refreshFeed(uid) {
  try {
    return new Promise((resolve, reject) => {
      getUser(uid).then((currentUser) => {
        getThoughts(currentUser).then((thoughts) => {
          // thoughtCollabs = [[obj1, obj2], [obj3], ...]
          var data = {};
          for (var i = 0; i < thoughts.length; i++) {
            const docData = thoughts[i];

            data[docData.id] = {
              id: docData.id,
              creatorID: docData.name.id,
              name: docData.username,
              imageURL: docData.imageURL,
              profileURL: docData.profileURL,
              time: calculateTimeDiffFromNow(docData.time.toDate()),
              // TODO: For some reason, the image loading puts things out of order
              rawTime: docData.lastInteraction,
              postTime: docData.time.toDate(),
              collabs: [],
              emojis: docData.emojiSize,
              reactions: 0,
              thoughtUID: docData.id,
              thought: docData.thought,
            };
          }
          resolve(data);
        });
      });
    });
  } catch (error) {
    console.log(error);
  }
}
