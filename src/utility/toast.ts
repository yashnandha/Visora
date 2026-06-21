// Toast helper — wire to your toast library.
export const showToast = (message: string) => {
  if (__DEV__) console.log('[toast]', message);
};
