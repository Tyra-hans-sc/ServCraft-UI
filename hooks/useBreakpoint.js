import React, {useState, useEffect} from 'react';
import useWindowSize from './useWindowSize';
import * as Enums from '../utils/enums';

const useBreakpoint = () => {

  const getDeviceConfig = (width) => {
    if (width < 320) {
      return Enums.Breakpoint.xs;
    } else if (width >= 320 && width < 768 ) {
      return Enums.Breakpoint.sm;
    } else if (width >= 768 && width < 1024) {
      return Enums.Breakpoint.md;
    } else if (width >= 1024) {
      return Enums.Breakpoint.lg;
    }
  };

  const windowSize = useWindowSize();

  return getDeviceConfig(windowSize.width);
}

export default useBreakpoint;
