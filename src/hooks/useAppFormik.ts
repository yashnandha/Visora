import { FormikHelpers, FormikState } from 'formik';
import { useCallback } from 'react';

const useFormikUpdater = <T extends Record<string, any>>(
  formik: Pick<FormikHelpers<T>, 'setValues'> & { values: T },
) => {
  const updateValues = useCallback(
    (key: keyof T, value: T[keyof T]) => {
      formik.setValues(prevValues => ({
        ...prevValues,
        [key]: value,
      }));
    },
    [formik],
  );

  return updateValues;
};

const useFormikError = <T extends Record<string, any>>(
  formik: FormikState<T>,
) => {
  const getFieldError = useCallback(
    <K extends keyof T>(key: K): T[K] | null => {
      const isTouched = formik.touched[key];
      const error = formik.errors[key];

      if (isTouched && error !== undefined) {
        return error as T[K]; // Safely cast the error to the expected type
      }

      return null;
    },
    [formik.touched, formik.errors],
  );

  return getFieldError;
};

const useFormikValues = <T extends Record<string, any>>(
  formik: FormikState<T>,
) => {
  const getFieldValues = useCallback(
    <K extends keyof T>(key: K): T[K] | null => {
      const values = formik.values[key];
      if (values) return values as T[K]; // Safely cast the error to the expected type
      return null;
    },
    [formik.values],
  );

  return getFieldValues;
};

export { useFormikError, useFormikUpdater, useFormikValues };
