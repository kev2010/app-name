# app-name
an app name

you can see the working Figma design here: https://www.figma.com/file/JCT9d4z6z8gZrKZEPPVdNf/%3F%3F%3F%3F?node-id=34%3A1178&t=ZUwX6lgrlTbFxjs5-1

general rundown of this repository is as follows...

this code is react native and runs with expo (you can google to figure out how to install the right packages and run everything - but npm install should be enough i think?). the backend is currently using Firebase, with Firestore as the NoSQL database. if you need access, just lmk ur email address. you can see the sample structure of the database below (reactions will be a collection within each "thoughts" document)

<img width="1284" alt="image" src="https://user-images.githubusercontent.com/46427633/212521339-95eb0d99-579c-49ba-abac-3beb3dbb1e53.png">

To navigate between screens, React Native Navigation is used. Recoil is used for global state management (currently just whether the user is logged in or not). The Nav file contains the navigation stack, which is a child of App.js because the Recoil Root needs to be a parent. globalState.js contains the global state.

Feed.js is the component for the thought feed (calls the Firebase Firestore - this part was a nightmare lmao).

Handle.js is the custom component for the Bottom Sheet handle (Bottom Sheet imported as a component in App.js). the animation doesn't actually work, but it does flip.

Think.js is the component for typing in thoughts when you swipe up the Bottom Sheet in App.js

Thought.js is the component for the actual thought you have. Feed.js uses Thought components to display each item.

Phone.js is the component for the "Enter your phone number" screen in the login process. haven't figured out yet how to deal with the order, so i just made it a working component for now.

Screens is the folder that includes the different screens.
