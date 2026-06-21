//@ts-nocheck
import {
  CommonActions,
  createNavigationContainerRef,
} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: any) {
  navigationRef.current?.navigate(name, params);
}
export function goBack() {
  navigationRef.current?.goBack();
}

export function navigateAndReset(routes = [], index = 0) {
  navigationRef.current?.dispatch(
    CommonActions.reset({
      index,
      routes,
    }),
  );
}

export function navigateAndSimpleReset(name, index = 0) {
  navigationRef.current?.dispatch(
    CommonActions.reset({
      index,
      routes: [{name}],
    }),
  );
}
