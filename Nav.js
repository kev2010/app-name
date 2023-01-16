import React from "react";
import HomeScreen from "./screens/HomeScreen";
import NameScreen from "./screens/NameScreen";
import { useRecoilState } from "recoil";
import { userLoginState } from "./globalState";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PhoneScreen from "./screens/PhoneScreen";

const Nav = ({}) => {
  const [userLogin, setUserLogin] = useRecoilState(userLoginState);
  const Stack = createNativeStackNavigator();
  console.log("looking into nav", userLogin);
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {userLogin ? (
          // User is signed in
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <>
            <Stack.Screen name="Name" component={NameScreen} />
            <Stack.Screen name="Phone" component={PhoneScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Nav;
