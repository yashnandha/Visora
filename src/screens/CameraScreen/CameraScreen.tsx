import React from "react";
import { Text, View } from "react-native";
import { Camera } from "react-native-vision-camera";
import useCameraScreen from "./useCameraScreen";

const CameraScreen = () => {
  const { device, hasPermission, requestPermission } = useCameraScreen()
  return (
    <Camera
      style={{ flex: 1 }}
      isActive={true}
      device='back'
      enableLowLightBoost={true}
    />
  )
}

export default CameraScreen