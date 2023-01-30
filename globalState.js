const { atom, selector } = require("recoil");

// TODO: Make Recoil persist
export const userState = atom({
  key: "userState",
  default: {
    uid: "TAKLar06V3UPXUMll72Kqj51CfG2",
    username: "kev2023",
    name: "Kevin Jiang",
    friends: [],
    friendRequests: [],
    sentRequests: [],
  },
  // default: {},
});

export const verificationState = atom({
  key: "verificationState",
  default: "",
});
