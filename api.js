import { collection, doc, setDoc, getDocs, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

// TODO: Needed because of dumb bug of "add document" after Firebase phone number authentication. So to circumvent it, we do a dummy call BEFORE we've been signed in and then add the user during "onSubmit" in UsernameScreen. Why does this work? I don't know bro.
export async function dummyCall() {
  console.log("executing dummy call");
  await setDoc(doc(db, "users", "a"), {});
}

export async function createUser(uid, displayName, username) {
  console.log("initializing", uid, displayName);
  await setDoc(doc(db, "users", uid), {
    name: displayName,
    username: username,
  });
}

export async function getThoughts() {
  try {
    return getDocs(collection(db, "thoughts"));
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
