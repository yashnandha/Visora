/**
 * First value is for getting value / reading value from state
 * Second value is for update value based on key in state
 * Third value is for reset state to defaultValue
 * Forth value is for set state value using `...` operator
 */

import { useState } from 'react';

// Generate all possible nested keys for better autocomplete support
type NestedKey<T, P extends string = ''> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? P extends ''
          ? NestedKey<T[K], K> | K
          : NestedKey<T[K], `${P}.${K}`> | `${P}.${K}`
        : never;
    }[keyof T]
  : never;

// Utility function to update nested state
const setNestedValue = <T extends object>(
  obj: T,
  path: NestedKey<T>,
  value: any,
): T => {
  const keys = (path as string).toString().split('.');
  const lastKey = keys.pop()!;
  let nestedObj: any = { ...obj };

  let temp = nestedObj;
  for (const key of keys) {
    temp[key] = temp[key] ? { ...temp[key] } : {};
    temp = temp[key];
  }
  temp[lastKey] = value;

  return nestedObj;
};

// Custom hook with autocomplete support for nested keys
export const useAppState = <T extends object>(defaultValue: T) => {
  const [state, setState] = useState<T>(defaultValue);

  const resetState = () => setState(defaultValue);

  const updateState = <K extends NestedKey<T>>(key: K, value: any) => {
    setState(prevState => setNestedValue(prevState, key, value));
  };

  return [state, updateState, resetState, setState] as const;
};

export default useAppState;
