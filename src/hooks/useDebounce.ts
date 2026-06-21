/**
 *  useDebounce is use for search query for block multiple query when type faster
 */

import React, {useEffect, useState} from 'react';

const useDebounce = (searchValues: string) => {
  const [debounceVal, setDebounceVal] = useState<string | null>(null);
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setDebounceVal(searchValues);
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchValues]);
  return {
    debounceVal,
  };
};

export default useDebounce;
