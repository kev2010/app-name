# app-name
an app name

you can see the working Figma design here: https://www.figma.com/file/JCT9d4z6z8gZrKZEPPVdNf/%3F%3F%3F%3F?node-id=34%3A1178&t=ZUwX6lgrlTbFxjs5-1

general rundown of this repository is as follows...

this code is react native and runs with expo (you can google to figure out how to install the right packages and run everything - but npm install should be enough i think?). the backend is currently using Firebase, with Firestore as the NoSQL database. if you need access, just lmk ur email address. you can see the sample structure of the database below (reactions will be a collection within each "thoughts" document)

<img width="1284" alt="image" src="https://user-images.githubusercontent.com/46427633/212521339-95eb0d99-579c-49ba-abac-3beb3dbb1e53.png">


App.js is the main file for now with the supporting components under the components folder. App.js contains code for the main screen and any key iteractions.

Feed.js is the component for the thought feed (calls the Firebase Firestore - this part was a nightmare lmao).

Handle.js is the custom component for the Bottom Sheet handle (Bottom Sheet imported as a component in App.js). the animation doesn't actually work, but it does flip.

Think.js is the component for typing in thoughts when you swipe up the Bottom Sheet in App.js

Thought.js is the component for the actual thought you have. Feed.js uses Thought components to display each item.
