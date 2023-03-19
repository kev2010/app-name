import React from "react";
import HomeScreen from "./screens/HomeScreen";
import NameScreen from "./screens/NameScreen";
import PhoneScreen from "./screens/PhoneScreen";
import VerificationScreen from "./screens/VerificationScreen";
import UsernameScreen from "./screens/UsernameScreen";
import FriendsScreen from "./screens/FriendsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ChatsScreen from "./screens/ChatsScreen";
import SingleChatScreen from "./screens/SingleChatScreen";
import ThinkScreen from "./screens/ThinkScreen";
import { useRecoilState } from "recoil";
import { userState } from "./globalState";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Nav = ({}) => {
  const [user, setUser] = useRecoilState(userState);
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {user.username == null ? (
          <>
            <Stack.Screen name="Name" component={NameScreen} />
            <Stack.Screen name="Phone" component={PhoneScreen} />
            <Stack.Screen name="Verification" component={VerificationScreen} />
            <Stack.Screen name="Username" component={UsernameScreen} />
          </>
        ) : (
          // User is signed in
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Reactions" component={SingleChatScreen} />
            <Stack.Screen name="Friends" component={FriendsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Chats" component={ChatsScreen} />
            <Stack.Screen name="Think" component={ThinkScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default Nav;
