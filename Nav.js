import React from "react";
import HomeScreen from "./screens/HomeScreen";
import NameScreen from "./screens/NameScreen";
import PhoneScreen from "./screens/PhoneScreen";
import VerificationScreen from "./screens/VerificationScreen";
import UsernameScreen from "./screens/UsernameScreen";
import { useRecoilState } from "recoil";
import { userState } from "./globalState";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Nav = ({}) => {
  const [user, setUser] = useRecoilState(userState);
  const Stack = createNativeStackNavigator();
  console.log("looking into nav", user);
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
          <Stack.Screen name="Home" component={HomeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Nav;
