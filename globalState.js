const { atom } = require("recoil");

export const userLoginState = atom({
  key: "userLoginState",
  default: false,
});
