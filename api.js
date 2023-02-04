import {
  collection,
  doc,
  setDoc,
  addDoc,
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
} from "firebase/firestore";
import {
  ref,
  uploadString,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "./firebaseConfig";

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

export async function getUser(uid) {
  try {
    return getDoc(doc(db, "users", uid));
  } catch (error) {}
}

// TODO: Figure out if we want to display user's own thoughts in the feed
// TODO: Right now we're only grabbing thoughts in the past 3 days. We'll have to do some pagination later
export async function getThoughts(uid) {
  try {
    return new Promise((resolve, reject) => {
      const currentUserRef = doc(db, "users", uid);
      getUser(uid).then((currentUser) => {
        const allValid = [...currentUser.data().friends, currentUserRef];
        let cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 7);
        const q = query(
          collection(db, "thoughts"),
          where("name", "in", allValid),
          where("time", ">=", cutoff),
          orderBy("time", "desc")
        );
        resolve(getDocs(q));
      });
    });
  } catch (error) {
    console.log(error);
  }
}

export async function getUsersOfThoughts(thoughts) {
  var results = [];
  thoughts.forEach(function (doc) {
    // push promise from get into results
    results.push(getDoc(doc.data().name));
  });
  return Promise.all(results);
}

export async function getUsersFromRefList(refs) {
  var results = [];
  refs.forEach(function (doc) {
    results.push(getDoc(doc));
  });
  return Promise.all(results);
}

export async function getCollabsOfThoughts(thoughts) {
  var results = [];
  thoughts.forEach(function (doc) {
    // doc.data().collabs = [ref1, ref2, ...]
    // Key thing to remember is to push promises, otherwise things will NOT return in the right order!
    results.push(getUsersFromRefList(doc.data().collabs));
  });
  // results = [[obj1, obj2], [obj3], ...]
  return Promise.all(results);
}

export async function addThought(uid, thought) {
  return new Promise((resolve, reject) => {
    const currentUserRef = doc(db, "users", uid);
    addDoc(collection(db, "thoughts"), {
      collabs: [],
      name: currentUserRef,
      tags: [],
      thought: thought,
      time: serverTimestamp(),
    }).then((docRef) => {
      resolve(docRef.id);
    });
  });
}

export async function addComment(thoughtUID, userUID, comment) {
  return new Promise((resolve, reject) => {
    const currentUserRef = doc(db, "users", userUID);
    const originalThoughtRef = doc(db, "thoughts", thoughtUID);
    const reactionsRef = collection(db, `thoughts/${thoughtUID}/reactions`);
    addDoc(reactionsRef, {
      name: currentUserRef,
      originalThought: originalThoughtRef,
      text: comment,
      time: serverTimestamp(),
    }).then(() => {
      resolve(true);
    });
  });
}

export async function getReactions(thoughtUID) {
  return new Promise((resolve, reject) => {
    const reactionsRef = collection(db, `thoughts/${thoughtUID}/reactions`);
    getDocs(query(reactionsRef)).then((result) => {
      resolve(result);
    });
  });
}

export async function getReactionsSizeOfThoughts(thoughts) {
  var results = [];
  // IMPORTANT: Can't do await on forEach, so make sure to do a regular for loop
  for (const doc of thoughts.docs) {
    // Key thing to remember is to push promises, otherwise things will NOT return in the right order!
    await getReactions(doc.id).then((reactions) => {
      results.push(reactions.size);
    });
  }

  return Promise.all(results);
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

export async function getImagesOfThoughts(thoughts) {
  var results = [];
  thoughts.forEach(async function (doc) {
    results.push(getThoughtImage(doc.id));
  });
  return Promise.all(results);
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
