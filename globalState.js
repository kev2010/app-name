const { atom } = require("recoil");

export const userLoginState = atom({
  key: "userLoginState",
  default: false,
});

export const fullNameState = atom({
  key: "fullNameState",
  default: "",
});

export const verificationState = atom({
  key: "verificationState",
  default: "",
});
