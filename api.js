import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

// TODO: Needed because of dumb bug of "add document" after Firebase phone number authentication. So to circumvent it, we do a dummy call BEFORE we've been signed in and then add the user during "onSubmit" in UsernameScreen. Why does this work? I don't know bro.
// TODO: Test if only doing a read instead of a write first works
export async function dummyCall() {
  await setDoc(doc(db, "users", "a"), {});
}

export async function getDocument(ref) {
  try {
    return getDoc(ref);
  } catch (error) {
    console.log(error);
  }
}

export async function checkUniqueUsername(username) {
  const querySnapshot = await getDocs(
    query(collection(db, "users"), where("username", "==", username))
  );
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data());
  });
  return querySnapshot.size == 0;
}

export async function createUser(uid, displayName, username) {
  console.log("initializing", uid, displayName);
  await setDoc(doc(db, "users", uid), {
    name: displayName,
    username: username,
    friends: [],
    friendRequests: [],
  });
}

export async function getUser(uid) {
  try {
    console.log("fetching", uid);
    return getDoc(doc(db, "users", uid));
  } catch (error) {
    console.log(error);
  }
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

export async function removeFriend(uid, friendUID) {}
