import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '../hooks/useRedux';
import { Login } from '../screens/auth/login/Login';
import { BottomNavigator } from './bottom/BottomNavigator';
import { AuthStackParamList } from './stackParams';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const RootNavigator = () => {
  const { isAuthenticated } = useAppSelector((state) => state.users);

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <BottomNavigator />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
export * from './bottom/BottomNavigator';
export * from './stackParams';
