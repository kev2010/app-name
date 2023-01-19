const { atom, selector } = require("recoil");
import { getUser } from "./api";

export const userState = atom({
  key: "userState",
  default: {
    uid: "TAKLar06V3UPXUMll72Kqj51CfG2",
    username: "kev2018",
    friends: [],
    friendRequests: [],
  },
  // default: {},
});

export const verificationState = atom({
  key: "verificationState",
  default: "",
});

// export const userFriendsState = selector({
//   key: "userFriendsState",
//   get: async ({ get }) => {
//     const user = get(userState);
//     const friends = Promise.all(
//       user.friends.map(async (uid) => {
//         await getUser(uid).then((user) => {
//           return {
//             uid: uid,
//             name: user.data().name,
//             username: user.data().username,
//           };
//         });
//       })
//     );
//     console.log("wtfff", friends[0]);
//     return friends;
//   },
// });

// const userFriendRequestsState = selector({
//   key: "userFriendRequestsState",
//   get: ({ get }) => {
//     const fontSize = get(fontSizeState);
//     const unit = "px";
//
//     return `${fontSize}${unit}`;
//   },
// });
