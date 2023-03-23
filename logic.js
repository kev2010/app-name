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
            const score = calculateScore(
              docData.emojiSize,
              docData.participants,
              docData.time.toDate(),
              docData.lastInteraction.toDate()
            );

            data[docData.id] = {
              id: docData.id,
              creatorID: docData.name.id,
              name: docData.username,
              imageURL: docData.imageURL,
              profileURL: docData.profileURL,
              time: calculateTimeDiffFromNow(docData.time.toDate()),
              participants: docData.participants,
              views: docData.views.length,
              // TODO: For some reason, the image loading puts things out of order
              rawTime: docData.lastInteraction,
              postTime: docData.time.toDate(),
              collabs: [],
              emojis: docData.emojiSize,
              reactions: 0,
              thoughtUID: docData.id,
              thought: docData.thought,
              score: score,
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

export function calculateScore(
  emojis,
  participants,
  postTime,
  lastInteractionTime
) {
  // Calulate difference in days between postTime and now
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const millisecondsPerMinute = 1000 * 60;
  const timeScore =
    10000000 /
    10 ** Math.floor(Math.abs(new Date() - postTime) / millisecondsPerDay);
  const emojiScore = emojis * 10;
  const participantScore = (participants.length - 1) * 30;
  const interactionScore =
    10 /
    10 **
      Math.floor(
        Math.abs(new Date() - lastInteractionTime) / millisecondsPerMinute
      );

  return timeScore + emojiScore + participantScore + interactionScore;
}
