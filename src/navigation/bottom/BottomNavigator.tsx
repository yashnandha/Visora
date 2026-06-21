import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CameraScreen } from '../../screens/main/camera/CameraScreen';
import { GalleryScreen } from '../../screens/main/gallery/GalleryScreen';
import { MainTabParamList } from '../stackParams';
import { Camera, Image } from 'lucide-react-native';
import { colors } from '../../theme/color';
import { StyleSheet, Platform } from 'react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const BottomNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary, // Vibrant accent
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Camera size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{
          tabBarLabel: 'Sync & Gallery',
          tabBarIcon: ({ color, size }) => <Image size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#121214', // Sleek dark slate
    borderTopWidth: 1,
    borderTopColor: '#252528',
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontFamily: 'System',
    fontWeight: '600',
  },
});
export default BottomNavigator;
