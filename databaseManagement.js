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
        originalThought: docData.id,
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
          originalThought: docData.id,
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
