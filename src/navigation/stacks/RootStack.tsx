import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParams } from "../rootStackParams";

const Stack = createNativeStackNavigator<RootStackParams>();
const RootStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: "none",
      }}>

    </Stack.Navigator>
  );
};

export default RootStack;
