import { NavigationContainer } from "@react-navigation/native";
import { navigationRef } from "@utility/navigationService";
import React from "react";
import BootSplash from "react-native-bootsplash";
import RootStack from "./stacks/RootStack";

const Route: React.FC = () => {
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        BootSplash.hide({ fade: true });
      }}>
      <RootStack />
    </NavigationContainer>
  );
};

export default Route;
