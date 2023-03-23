// Scripts to help overhaul the Firebase Firestore Database
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  getDoc,
  collectionGroup,
  serverTimestamp,
} from "firebase/firestore";
import {
  getProfilePicture,
  getThoughtImage,
  getEmojiSizeOfThought,
} from "./api";
import { db } from "./firebaseConfig";

// Adding a lastInteraction field to all thoughts documents so that we can keep showing thoughts that have new comments on it
export async function addLastInteraction() {
  const thoughtsRef = collection(db, "thoughts");
  getDocs(thoughtsRef).then((result) => {
    result.forEach((docData) => {
      getRecentReaction(docData.id).then((recentReaction) => {
        if (recentReaction.length > 0) {
          updateDoc(doc(db, "thoughts", docData.id), {
            lastInteraction:
              recentReaction[0].data().time.toDate() >=
              docData.data().time.toDate()
                ? recentReaction[0].data().time.toDate()
                : docData.data().time.toDate(),
          });
        } else {
          updateDoc(doc(db, "thoughts", docData.id), {
            lastInteraction: docData.data().time.toDate(),
          });
        }
      });
    });
  });
}

export async function getRecentReaction(thoughtUID) {
  return new Promise((resolve, reject) => {
    const reactionsRef = collection(db, `thoughts/${thoughtUID}/reactions`);
    getDocs(query(reactionsRef, orderBy("time", "desc"), limit(1))).then(
      (result) => {
        resolve(result.docs);
      }
    );
  });
}

// Adding a username field to all reactions
export async function addUsernameToReactions() {
  getDocs(query(collectionGroup(db, "reactions"))).then((results) => {
    results.docs.forEach((docData) => {
      getDoc(docData.data().name).then((userDoc) => {
        updateDoc(doc(db, docData.ref.path), {
          username: userDoc.data().username,
        });
      });
    });
  });
}

// Adding a photoURL field to all reactions
export async function addPhotoURLToReactions() {
  getDocs(query(collectionGroup(db, "reactions"))).then((results) => {
    results.docs.forEach((docData) => {
      getProfilePicture(docData.data().name.id).then((photoURL) => {
        // console.log(photoURL);
        updateDoc(doc(db, docData.ref.path), {
          photoURL: photoURL,
        });
      });
    });
  });
}

// Adding a photoURL field to all user docs
export async function addPhotoURLToUsers() {
  getDocs(collection(db, "users")).then((results) => {
    results.docs.forEach((docData) => {
      getProfilePicture(docData.id).then((photoURL) => {
        updateDoc(doc(db, "users", docData.id), {
          photoURL: photoURL,
        });
      });
    });
  });
}

// Add profile picture and image url to all thoughts
export async function addProfilePictureAndImageURLToThoughts() {
  getDocs(collection(db, "thoughts")).then((results) => {
    results.docs.forEach((docData) => {
      getProfilePicture(docData.data().name.id).then((photoURL) => {
        getThoughtImage(docData.id).then((imageURL) => {
          updateDoc(doc(db, "thoughts", docData.id), {
            profileURL: photoURL,
            imageURL: imageURL,
          });
        });
      });
    });
  });
}

// Add username field to all thoughts
export async function addUsernameToThoughts() {
  getDocs(collection(db, "thoughts")).then((results) => {
    results.docs.forEach((docData) => {
      getDoc(docData.data().name).then((userDoc) => {
        updateDoc(doc(db, "thoughts", docData.id), {
          username: userDoc.data().username,
        });
      });
    });
  });
}

// Add emojiSize field to all thoughts
export async function addEmojiSizeToThoughts() {
  getDocs(collection(db, "thoughts")).then((results) => {
    results.docs.forEach((docData) => {
      getEmojiSizeOfThought(docData.id).then((emojiSize) => {
        updateDoc(doc(db, "thoughts", docData.id), {
          emojiSize: emojiSize,
        });
      });
    });
  });
}

// Add imageURL field to all reactions
export async function addImageURLToReactions() {
  getDocs(query(collectionGroup(db, "reactions"))).then((results) => {
    results.docs.forEach((docData) => {
      updateDoc(doc(db, docData.ref.path), {
        imageURL: "",
      });
    });
  });
}

// Adding original thought to all reactions
export async function addOriginalThoughtToReactions() {
  getDocs(collection(db, "thoughts")).then((results) => {
    results.docs.forEach((docData) => {
      // Send as two separate reactions if there is an image
      addDoc(collection(db, `thoughts/${docData.id}/reactions`), {
        imageURL: "",
        name: docData.data().name,
        originalThought: doc(db, "thoughts", docData.id),
        photoURL: docData.data().profileURL,
        text: docData.data().thought,
        time: docData.data().time,
        username:
          docData.data().username === undefined ? "" : docData.data().username,
      });

      if (docData.data().imageURL !== "") {
        addDoc(collection(db, `thoughts/${docData.id}/reactions`), {
          imageURL: docData.data().imageURL,
          name: docData.data().name,
          originalThought: doc(db, "thoughts", docData.id),
          photoURL: docData.data().profileURL,
          text: "",
          time: docData.data().time,
          username:
            docData.data().username === undefined
              ? ""
              : docData.data().username,
        });
      }
    });
  });
}

// Change original thought to all reactions
export async function changeOriginalThoughtToReactions() {
  getDocs(query(collectionGroup(db, "reactions"))).then((results) => {
    results.docs.forEach((docData) => {
      updateDoc(doc(db, docData.ref.path), {
        originalThought: doc(db, "thoughts", docData.ref.parent.parent.id),
      });
    });
  });
}

// Add participants field to all thoughts
export async function addParticipantsToThoughts() {
  getDocs(collection(db, "thoughts")).then((results) => {
    results.docs.forEach((docData) => {
      calculateParticipantsInThought(docData.id).then((participants) => {
        updateDoc(doc(db, "thoughts", docData.id), {
          participants: participants,
        });
      });
    });
  });
}

// Calculate participants in a thought
export async function calculateParticipantsInThought(thoughtUID) {
  return new Promise((resolve, reject) => {
    getDocs(query(collection(db, `thoughts/${thoughtUID}/reactions`))).then(
      (results) => {
        let participants = [];
        results.docs.forEach((docData) => {
          if (!participants.includes(docData.data().username)) {
            participants.push(docData.data().username);
          }
        });
        resolve(participants);
      }
    );
  });
}

// Add most recent reaction to all thoughts
export async function addMostRecentReactionToThoughts() {
  getDocs(collection(db, "thoughts")).then((results) => {
    results.docs.forEach((docData) => {
      getRecentReaction(docData.id).then((mostRecentReaction) => {
        updateDoc(doc(db, "thoughts", docData.id), {
          lastReaction: mostRecentReaction[0].data(),
        });
      });
    });
  });
}

// Change participants array in thoughts to a map
export async function changeParticipantsArrayToMap() {
  getDocs(collection(db, "thoughts")).then((results) => {
    results.docs.forEach((docData) => {
      // Check if participants is an array
      if (Array.isArray(docData.data().participants)) {
        let participantsMap = {};
        docData.data().participants.forEach((participant) => {
          participantsMap[participant] = serverTimestamp();
        });
        updateDoc(doc(db, "thoughts", docData.id), {
          participants: participantsMap,
        });
      }
    });
  });
}

// Reverse participants map in thoughts to an array
export async function reverseParticipantsMapToArray() {
  getDocs(collection(db, "thoughts")).then((results) => {
    results.docs.forEach((docData) => {
      // Check if participants is an array
      if (typeof docData.data().participants === "object") {
        let participantsArray = [];
        Object.keys(docData.data().participants).forEach((participant) => {
          participantsArray.push(participant);
        });
        updateDoc(doc(db, "thoughts", docData.id), {
          participants: participantsArray,
        });
      }
    });
  });
}

// Add lastReadTimestamps object to all thoughts, where the fields are the usernames of the participants
export async function addLastReadTimestampsToThoughts() {
  getDocs(collection(db, "thoughts")).then((results) => {
    results.docs.forEach((docData) => {
      let lastReadTimestamps = {};
      docData.data().participants.forEach((participant) => {
        lastReadTimestamps[participant] = serverTimestamp();
      });
      updateDoc(doc(db, "thoughts", docData.id), {
        lastReadTimestamps: lastReadTimestamps,
      });
    });
  });
}

// Add a manuallyMarkedUnread array field to all users
export async function addManuallyMarkedUnreadToUsers() {
  getDocs(collection(db, "users")).then((results) => {
    results.docs.forEach((docData) => {
      updateDoc(doc(db, "users", docData.id), {
        manuallyMarkedUnread: [],
      });
    });
  });
}

// Add a archive array field to all users
export async function addArchiveToUsers() {
  getDocs(collection(db, "users")).then((results) => {
    results.docs.forEach((docData) => {
      updateDoc(doc(db, "users", docData.id), {
        archived: [],
      });
    });
  });
}

// Add views field to all thoughts
export async function addViewsToThoughts() {
  getDocs(collection(db, "thoughts")).then((results) => {
    results.docs.forEach((docData) => {
      updateDoc(doc(db, "thoughts", docData.id), {
        views: [],
      });
    });
  });
}

// Change each friend reference in friends array of users to a map of usernames as keys and ID, name, and photoURL as values
export async function changeFriendsArrayToMap() {
  getDocs(collection(db, "users")).then((results) => {
    results.docs.forEach((docData) => {
      let friendsMap = {};
      docData.data().friends.forEach((friend) => {
        getDoc(friend).then((friendDoc) => {
          friendsMap[friendDoc.username] = {
            id: friendDoc.id,
            name: friendDoc.name,
            photoURL: friendDoc.photoURL,
          };
        });
      });
      updateDoc(doc(db, "users", docData.id), {
        friends: friendsMap,
      });
    });
  });
}

// Add invited array to each thought
export async function addInvitedArrayToThoughts() {
  getDocs(collection(db, "thoughts")).then((results) => {
    results.docs.forEach((docData) => {
      updateDoc(doc(db, "thoughts", docData.id), {
        invited: [],
      });
    });
  });
}
