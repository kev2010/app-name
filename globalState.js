import AsyncStorage from "@react-native-async-storage/async-storage";
import { atom, DefaultValue } from "recoil";

function persistAtom(key) {
  return ({ setSelf, onSet }) => {
    setSelf(
      AsyncStorage.getItem(key).then(
        (savedValue) =>
          savedValue != null ? JSON.parse(savedValue) : new DefaultValue() // Abort initialization if no value was stored
      )
    );

    // Subscribe to state changes and persist them to localForage
    onSet((newValue, _, isReset) => {
      isReset
        ? AsyncStorage.removeItem(key)
        : AsyncStorage.setItem(key, JSON.stringify(newValue));
    });
  };
}

export const userState = atom({
  key: "userState",
  // default: {
  //   uid: "TAKLar06V3UPXUMll72Kqj51CfG2",
  //   username: "kev2023",
  //   name: "Kevin Jiang",
  //   friends: [],
  //   friendRequests: [],
  //   sentRequests: [],
  // },
  default: {},
  effects: [persistAtom("userState")],
});

export const verificationState = atom({
  key: "verificationState",
  default: "",
});

export const feedDataState = atom({
  key: "feedDataState",
  default: {},
});

export const feedLockedState = atom({
  key: "feedLockedState",
  default: true,
});
