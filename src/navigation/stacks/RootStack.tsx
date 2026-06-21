import CameraScreen from "@screens/CameraScreen/CameraScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParams } from "../rootStackParams";

const Stack = createNativeStackNavigator<RootStackParams>();
const RootStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="camera"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: "none",
      }}>
      <Stack.Screen name="camera" component={CameraScreen} />
    </Stack.Navigator>
  );
};

export default RootStack;
