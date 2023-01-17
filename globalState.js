const { atom } = require("recoil");

export const userState = atom({
  key: "userState",
  default: {},
});

export const verificationState = atom({
  key: "verificationState",
  default: "",
});
