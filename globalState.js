const { atom, selector } = require("recoil");

export const userState = atom({
  key: "userState",
  // default: {
  //   uid: "TAKLar06V3UPXUMll72Kqj51CfG2",
  //   username: "kev2018",
  //   friends: [],
  //   friendRequests: [],
  //   sentRequests: [],
  // },
  default: {},
});

export const verificationState = atom({
  key: "verificationState",
  default: "",
});
