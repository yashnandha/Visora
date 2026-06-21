import { useEffect } from 'react';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
const useCameraScreen = () => {
    const { hasPermission, requestPermission } = useCameraPermission()
    useEffect(() => {
        if (!hasPermission) requestPermission()
    }, [hasPermission, requestPermission])

    const device = useCameraDevice('back');
    return {
        hasPermission,
        requestPermission,
        device,
    }
}

export default useCameraScreen

