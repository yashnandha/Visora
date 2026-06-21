import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { signInStart, signInSuccess, signInFailure } from '../../../services/redux/users/userSlice';
import { googleAuthService } from '../../../services/api/gdrive';
import { showToast } from '../../../utility/toast';

export const useLogin = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.users);

  const handleGoogleSignIn = async () => {
    dispatch(signInStart());
    try {
      const { user, accessToken } = await googleAuthService.signIn();
      const userData = {
        id: user.user.id,
        name: user.user.name,
        email: user.user.email,
        photo: user.user.photo,
      };
      dispatch(signInSuccess({ user: userData, accessToken }));
      showToast(`Welcome, ${userData.name || userData.email}!`);
    } catch (err: any) {
      console.error('[Login Hook] Google Auth error:', err);
      // Clean error messaging
      let errorMessage = 'Google Sign-In failed';
      if (err.code === 'SIGN_IN_CANCELLED') {
        errorMessage = 'Sign-in cancelled by user';
      } else if (err.code === 'IN_PROGRESS') {
        errorMessage = 'Sign-in already in progress';
      } else if (err.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        errorMessage = 'Google Play Services not available';
      }
      
      dispatch(signInFailure(errorMessage));
      showToast(errorMessage);
    }
  };

  return {
    isLoading,
    error,
    handleGoogleSignIn,
  };
};
