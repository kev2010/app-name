import { getUser, getThoughts } from "./api";
import { calculateTimeDiffFromNow } from "./helpers";

// TODO: there are definitely other logic functions that should be extracted from components and placed in this file
export async function refreshFeed(uid, discover) {
  try {
    return new Promise((resolve, reject) => {
      getUser(uid).then((currentUser) => {
        getThoughts(currentUser, discover).then((thoughts) => {
          // thoughtCollabs = [[obj1, obj2], [obj3], ...]
          var data = {};
          for (var i = 0; i < thoughts.length; i++) {
            const docData = thoughts[i];
            const score = calculateScore(
              docData.emojiSize,
              docData.participants,
              docData.time.toDate(),
              docData.lastInteraction.toDate(),
              docData.faceReactions
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
              faceReactions: docData.faceReactions,
              visibility: docData.visibility,
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
  lastInteractionTime,
  faceReactions
) {
  // Calulate difference in days between postTime and now
  const millisecondsPerHalfDay = 1000 * 60 * 60 * 12;
  const millisecondsPerMinute = 1000 * 60;
  const timeScore =
    10000 /
    (1 + Math.floor(Math.abs(new Date() - postTime) / millisecondsPerHalfDay));
  const emojiScore = emojis * 1;
  const participantScore = (participants.length - 1) * 3;
  const faceReactionScore = faceReactions.length * 2;
  const interactionScore =
    1 /
    10 **
      Math.floor(
        Math.abs(new Date() - lastInteractionTime) / millisecondsPerMinute
      );

  return (
    timeScore +
    emojiScore +
    participantScore +
    faceReactionScore +
    interactionScore
  );
}
