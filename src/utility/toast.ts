import RNToast from 'react-native-toast-message';

export const Toast = (
  text: string,
  _backgroundColor?: string,
  duration: number = 3000,
) => {
  RNToast.show({
    type: 'success',
    text1: text?.toString(),
    visibilityTime: duration,
  });
};

export const ErrorToast = (text?: string, duration: number = 3000) => {
  RNToast.show({
    type: 'error',
    text1: text || 'Something went wrong Please try again',
    visibilityTime: duration,
  });
};
