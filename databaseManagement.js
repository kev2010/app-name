// Scripts to help overhaul the Firebase Firestore Database
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
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
