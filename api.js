import {
  collection,
  collectionGroup,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  getDocs,
  getDoc,
  updateDoc,
  arrayRemove,
  query,
  where,
  orderBy,
  limit,
  arrayUnion,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import {
  ref,
  uploadString,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "./firebaseConfig";
const _ = require("lodash");

// TODO: Needed because of dumb bug of "add document" after Firebase phone number authentication. So to circumvent it, we do a dummy call BEFORE we've been signed in and then add the user during "onSubmit" in UsernameScreen. Why does this work? I don't know bro.
// TODO: Test if only doing a read instead of a write first works
export async function dummyCall() {
  await setDoc(doc(db, "users", "a"), {});
}

export async function checkUniqueUsername(username) {
  const querySnapshot = await getDocs(
    query(collection(db, "users"), where("username", "==", username))
  );
  return querySnapshot.size == 0;
}

export async function checkUserExists(uid) {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return {
    exists: docSnap.exists(),
    data: docSnap.data(),
  };
}

export async function createUser(uid, displayName, username) {
  await setDoc(doc(db, "users", uid), {
    name: displayName,
    username: username,
    friends: [],
    friendRequests: [],
    sentRequests: [],
  });
}

export async function updateUserPhoneNumber(uid, phoneNumber) {
  const currentUserRef = doc(db, "users", uid);
  await updateDoc(currentUserRef, {
    phoneNumber: phoneNumber,
  });
}

export async function getMultipleUsersByPhoneNumbers(phoneNumberList) {
  var results = [];
  phoneNumberList.forEach(async function (phoneNumber) {
    results.push(getUserByPhoneNumber(phoneNumber));
  });
  return Promise.all(results);
}

export async function getUserByPhoneNumber(phoneNumber) {
  return new Promise((resolve, reject) => {
    getDocs(
      query(
        collection(db, "users"),
        where("phoneNumber", "==", phoneNumber),
        limit(1)
      )
    ).then((results) => {
      resolve(results.docs.length > 0 ? results.docs[0] : null);
    });
  });
}

export async function getUser(uid) {
  try {
    return getDoc(doc(db, "users", uid));
  } catch (error) {}
}

export async function checkUserPostedToday(uid) {
  return new Promise((resolve, reject) => {
    // TODO: Reset at 2pm UTC, which is 9am ET
    const currentTime = new Date();
    const startOfToday = new Date();
    startOfToday.setUTCHours(14, 0, 0, 0);
    if (startOfToday >= currentTime) {
      startOfToday.setUTCHours(-10, 0, 0, 0);
    }

    const currentUserRef = doc(db, "users", uid);
    getDocs(
      query(
        collection(db, "thoughts"),
        where("name", "==", currentUserRef),
        where("time", ">=", startOfToday)
      )
    ).then((results) => {
      resolve(results.docs.length > 0);
    });
  });
}

export async function checkUserCommentedToday(uid) {
  return new Promise((resolve, reject) => {
    // TODO: Reset at 2pm UTC, which is 9am ET
    const currentTime = new Date();
    const startOfToday = new Date();
    startOfToday.setUTCHours(14, 0, 0, 0);
    if (startOfToday >= currentTime) {
      startOfToday.setUTCHours(-10, 0, 0, 0);
    }

    const currentUserRef = doc(db, "users", uid);
    getDocs(
      query(
        collectionGroup(db, "reactions"),
        where("name", "==", currentUserRef),
        where("time", ">=", startOfToday)
      )
    ).then((results) => {
      resolve(results.docs.length > 1);
    });
  });
}

// TODO: Figure out if we want to display user's own thoughts in the feed
// TODO: Right now we're only grabbing thoughts in the past 3 days. We'll have to do some pagination later
export async function getThoughts(currentUser) {
  try {
    let cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const currentUserRef = doc(db, "users", currentUser.id);
    const batches = [];
    const allValid = [...currentUser.data().friends, currentUserRef];

    while (allValid.length) {
      // firestore limits batches to 10
      const batch = allValid.splice(0, 10);

      // add the batch request to to a queue
      batches.push(
        getDocs(
          query(
            collection(db, "thoughts"),
            where("name", "in", batch),
            where("lastInteraction", ">=", cutoff)
          )
        ).then((results) =>
          results.docs.map((result) => ({
            id: result.id,
            ...result.data(),
          }))
        )
      );
    }
    // after all of the data is fetched, return it
    return Promise.all(batches).then((content) => content.flat());
  } catch (error) {
    console.log(error);
  }
}

export async function getThought(uid) {
  return new Promise((resolve, reject) => {
    getDoc(doc(db, "thoughts", uid)).then((result) =>
      resolve({
        id: result.id,
        ...result.data(),
      })
    );
  });
}

export async function addThought(uid, profileURL, username, thought) {
  return new Promise((resolve, reject) => {
    const currentUserRef = doc(db, "users", uid);
    addDoc(collection(db, "thoughts"), {
      collabs: [],
      emojiSize: 0,
      imageURL: "",
      profileURL: profileURL,
      username: username,
      name: currentUserRef,
      tags: [],
      thought: thought,
      time: serverTimestamp(),
      lastInteraction: serverTimestamp(),
    }).then((docRef) => {
      addDoc(collection(db, `thoughts/${docRef.id}/reactions`), {
        imageURL: "",
        name: currentUserRef,
        originalThought: docRef.id,
        photoURL: profileURL,
        text: thought,
        time: serverTimestamp(),
        username: username,
      }).then(() => {
        resolve(docRef.id);
      });
    });
  });
}

export async function addImageToThought(
  uid,
  thoughtUID,
  profileURL,
  username,
  imageURL
) {
  if (imageURL != null && imageURL !== "") {
    const currentUserRef = doc(db, "users", uid);
    const docRef = doc(db, "thoughts", thoughtUID);

    await updateDoc(docRef, {
      imageURL: imageURL,
    });

    await addDoc(collection(db, `thoughts/${thoughtUID}/reactions`), {
      imageURL: imageURL,
      name: currentUserRef,
      originalThought: docRef.id,
      photoURL: profileURL,
      text: "",
      time: serverTimestamp(),
      username: username,
    });
  }
}

export async function deleteThought(uid) {
  // NOTE: this does NOT delete documents within the reactions subcollections
  await deleteDoc(doc(db, "thoughts", uid));
}

export async function addEmoji(thoughtUID, userUID, emoji) {
  return new Promise((resolve, reject) => {
    const currentUserRef = doc(db, "users", userUID);
    const originalThoughtRef = doc(db, "thoughts", thoughtUID);
    const emojisRef = collection(db, `thoughts/${thoughtUID}/emojis`);
    addDoc(emojisRef, {
      name: currentUserRef,
      originalThought: originalThoughtRef,
      emoji: emoji,
      time: serverTimestamp(),
    }).then(() => {
      resolve(true);
    });
  });
}

export async function getEmojis(thoughtUID) {
  return new Promise((resolve, reject) => {
    const reactionsRef = collection(db, `thoughts/${thoughtUID}/emojis`);
    getDocs(reactionsRef).then((result) => {
      resolve(result);
    });
  });
}

export async function getEmojiSizeOfThought(thoughtUID) {
  return getDocs(collection(db, `thoughts/${thoughtUID}/emojis`)).then(
    (collection) => collection.size
  );
}

export async function addComment(
  thoughtUID,
  userUID,
  userProfilePic,
  username,
  comment
) {
  return new Promise((resolve, reject) => {
    const currentUserRef = doc(db, "users", userUID);
    const originalThoughtRef = doc(db, "thoughts", thoughtUID);
    const reactionsRef = collection(db, `thoughts/${thoughtUID}/reactions`);
    addDoc(reactionsRef, {
      name: currentUserRef,
      originalThought: originalThoughtRef,
      username: username,
      text: comment,
      time: serverTimestamp(),
      photoURL: userProfilePic,
    }).then(() => {
      updateDoc(originalThoughtRef, {
        lastInteraction: serverTimestamp(),
      }).then(() => {
        resolve(true);
      });
    });
  });
}

export async function getReactions(thoughtUID) {
  return new Promise((resolve, reject) => {
    const reactionsRef = collection(db, `thoughts/${thoughtUID}/reactions`);
    getDocs(reactionsRef).then((result) => {
      resolve(result);
    });
  });
}

export async function getParticipants(thoughtUID) {
  var results = [];
  var userRefs = [];
  // Get original creator
  const originalThought = await getDoc(doc(db, "thoughts", thoughtUID));
  userRefs.push(originalThought.data().name);

  // Get list of all reaction participants
  const reactionsRef = collection(db, `thoughts/${thoughtUID}/reactions`);
  const reactions = await getDocs(reactionsRef);

  reactions.forEach((reactionDoc) => {
    userRefs.push(reactionDoc.data().name);
  });

  // Get the usernames of the union of the above
  for (const userRef of userRefs) {
    const userDoc = await getDoc(userRef);
    results.push(userDoc.data().username);
  }

  return [...new Set(results)];
}

export async function sendFriendRequest(uid, friendUID) {
  const currentUserRef = doc(db, "users", uid);
  const sentToUserRef = doc(db, "users", friendUID);
  // First update the friendRequests field of the user the request is sent to
  // Then update the sentRequests field of the original user
  await updateDoc(sentToUserRef, {
    friendRequests: arrayUnion(currentUserRef),
  }).then(
    updateDoc(currentUserRef, {
      sentRequests: arrayUnion(sentToUserRef),
    })
  );
}

// For now delete the request from both users (maybe in the future only delete the current request and not alert the friend that their request has been removed). This is for the direction of you, uid, sent a request to a potential friend, the friendUID
export async function deleteFriendRequest(uid, friendUID) {
  const currentUserRef = doc(db, "users", uid);
  const sentToUserRef = doc(db, "users", friendUID);
  // First update the friendRequests field of the user the request is sent to
  // Then update the sentRequests field of the original user
  await updateDoc(sentToUserRef, {
    friendRequests: arrayRemove(currentUserRef),
  }).then(
    updateDoc(currentUserRef, {
      sentRequests: arrayRemove(sentToUserRef),
    })
  );
}

// Make sure to add friends for both users
export async function addFriend(uid, friendUID) {
  const currentUserRef = doc(db, "users", uid);
  const friendRef = doc(db, "users", friendUID);
  await updateDoc(doc(db, "users", uid), {
    friends: arrayUnion(friendRef),
  }).then(
    updateDoc(doc(db, "users", friendUID), {
      friends: arrayUnion(currentUserRef),
    })
  );
}

// Make sure to remove friends from both the original user and the friend user
export async function removeFriend(uid, friendUID) {
  const currentUserRef = doc(db, "users", uid);
  const friendRef = doc(db, "users", friendUID);
  await updateDoc(doc(db, "users", uid), {
    friends: arrayRemove(friendRef),
  }).then(
    updateDoc(doc(db, "users", friendUID), {
      friends: arrayRemove(currentUserRef),
    })
  );
}

export async function getUsernamesStartingWith(text, resultLimit) {
  const querySnapshot = await getDocs(
    query(
      collection(db, "users"),
      where("username", ">=", text),
      where("username", "<=", text + "\uf8ff"),
      orderBy("username"),
      limit(resultLimit)
    )
  );
  return querySnapshot;
}

export async function uploadThoughtImage(imageAsset, thoughtUID) {
  try {
    // Why are we using XMLHttpRequest? See:
    // https://github.com/expo/expo/issues/2402#issuecomment-443726662
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", imageAsset.assets[0].uri, true);
      console.log("good news", imageAsset.assets[0].uri);
      xhr.send(null);
    });

    const fileRef = ref(storage, `thoughtImages/${thoughtUID}.jpg`);
    const result = await uploadBytes(fileRef, blob);

    // We're done with the blob, close and release it
    blob.close();

    return await getDownloadURL(fileRef);
  } catch (error) {
    console.log(error);
  }
}

export async function getThoughtImage(thoughtUID) {
  try {
    return new Promise((resolve, reject) => {
      const imageRef = ref(storage, `thoughtImages/${thoughtUID}.jpg`);
      // Get the download URL
      getDownloadURL(imageRef)
        .then((url) => {
          resolve(url);
        })
        .catch((error) => {
          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          switch (error.code) {
            case "storage/object-not-found":
              resolve("");
              break;
            case "storage/unauthorized":
              // User doesn't have permission to access the object
              console.log("Unauthorized access");
              resolve("");
              break;
            case "storage/canceled":
              console.log("User canceled the upload");
              resolve("");
              // User canceled the upload
              break;
            case "storage/unknown":
              console.log("Unknown error");
              resolve("");
              // Unknown error occurred, inspect the server response
              break;
          }
        });
    });
  } catch (error) {
    console.log(error);
  }
}

// TODO: Repeated code from uploadThoughtImage, so merge into one function that just uploads an image
export async function updateProfilePicture(uid, imageAsset) {
  try {
    // Why are we using XMLHttpRequest? See:
    // https://github.com/expo/expo/issues/2402#issuecomment-443726662
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", imageAsset.assets[0].uri, true);
      xhr.send(null);
    });

    const fileRef = ref(storage, `profileImages/${uid}.jpg`);
    const result = await uploadBytes(fileRef, blob);

    // We're done with the blob, close and release it
    blob.close();

    return await getDownloadURL(fileRef);
  } catch (error) {
    console.log(error);
  }
}

// Change photoURL in user profile, thoughts, and reactions
export async function changePhotoURLThoughts(uid, url) {
  const thoughtsQuery = query(
    collection(db, "thoughts"),
    where("name", "==", doc(db, "users", uid))
  );

  const reactionsQuery = query(
    collectionGroup(db, "reactions"),
    where("name", "==", doc(db, "users", uid))
  );

  updateDoc(doc(db, "users", uid), {
    photoURL: url,
  });

  getDocs(thoughtsQuery).then((thoughts) => {
    thoughts.docs.forEach((thoughtDoc) => {
      updateDoc(doc(db, "thoughts", thoughtDoc.id), {
        profileURL: url,
      });
    });
  });

  getDocs(reactionsQuery).then((reactions) => {
    reactions.docs.forEach((reactionDoc) => {
      updateDoc(reactionDoc.ref, {
        photoURL: url,
      });
    });
  });
}

// TODO: Repeated code from getThoughtImage, so merge into one function that just reads images
export async function getProfilePicture(userUID) {
  try {
    return new Promise((resolve, reject) => {
      const imageRef = ref(storage, `profileImages/${userUID}.jpg`);
      // Get the download URL
      getDownloadURL(imageRef)
        .then((url) => {
          resolve(url);
        })
        .catch((error) => {
          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          switch (error.code) {
            case "storage/object-not-found":
              resolve("");
              break;
            case "storage/unauthorized":
              // User doesn't have permission to access the object
              console.log("Unauthorized access");
              resolve("");
              break;
            case "storage/canceled":
              console.log("User canceled the upload");
              resolve("");
              // User canceled the upload
              break;
            case "storage/unknown":
              console.log("Unknown error");
              resolve("");
              // Unknown error occurred, inspect the server response
              break;
          }
        });
    });
  } catch (error) {
    console.log(error);
  }
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

// TODO: Eventually can turn this to a general purpose "updateUser" function
export async function updateNotificationToken(uid, notificationToken) {
  const currentUserRef = doc(db, "users", uid);
  await updateDoc(currentUserRef, {
    notificationToken: notificationToken,
  });
}

// TODO: Eventually can turn this to a general purpose "updateUser" function
export async function updateNotifyReplies(uid, setting) {
  const currentUserRef = doc(db, "users", uid);
  await updateDoc(currentUserRef, {
    notifyReplies: setting,
  });
}

export async function getUserAllChats(uid, callback) {
  console.log("going at it");
  // return new Promise((resolve, reject) => {
  // TODO: just cutting off activity at 10 days (your thoughts + your last reply to thoughts) for performance
  let cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const currentUserRef = doc(db, "users", uid);

  const thoughtsQuery = query(
    collection(db, "thoughts"),
    where("name", "==", currentUserRef),
    where("lastInteraction", ">=", cutoff)
  );

  const reactionsQuery = query(
    collectionGroup(db, "reactions"),
    where("name", "==", currentUserRef),
    where("time", ">=", cutoff)
  );

  const unsubscribeThoughts = onSnapshot(thoughtsQuery, (resultsThoughts) => {
    console.log("we're goign in the thoughtsquery");
    onSnapshot(reactionsQuery, (resultsReactions) => {
      console.log("we're goign in the reactionsquery");
      getOriginalThoughtsFromReactions(resultsReactions).then(
        (resultsReactionsThoughts) => {
          // Eliminate duplicates
          const combinedResults = _.unionBy(
            resultsReactionsThoughts,
            resultsThoughts.docs,
            "id"
          );
          callback(combinedResults);
        }
      );
    });
  });

  // Return the unsubscribe function to allow the caller to stop listening for updates
  return () => {
    unsubscribeThoughts();
  };

  // getDocs(thoughtsQuery).then((resultsThoughts) => {
  //   getDocs(reactionsQuery).then((resultsReactions) => {
  //     getOriginalThoughtsFromReactions(resultsReactions).then(
  //       (resultsReactionsThoughts) => {
  //         // Eliminate duplicates
  //         resolve(
  //           _.unionBy(resultsReactionsThoughts, resultsThoughts.docs, "id")
  //         );
  //       }
  //     );
  //   });
  // });
  // });
}

export async function getOriginalThoughtsFromReactions(reactions, cutoff) {
  var results = [];
  reactions.forEach(function (docData) {
    results.push(getDoc(docData.data().originalThought));
  });

  return Promise.all(results);
}
