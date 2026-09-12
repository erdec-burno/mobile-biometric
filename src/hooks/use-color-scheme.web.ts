import { type PropsWithChildren, createContext, createElement, useContext, useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

type ColorScheme = ReturnType<typeof useRNColorScheme>;

const ColorSchemeContext = createContext<ColorScheme | undefined>(undefined);

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
function useHydratedColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}

export function ColorSchemeProvider({ children }: PropsWithChildren) {
  const colorScheme = useHydratedColorScheme();

  return createElement(ColorSchemeContext.Provider, { value: colorScheme }, children);
}

export function useColorScheme() {
  const colorScheme = useHydratedColorScheme();
  const contextColorScheme = useContext(ColorSchemeContext);

  return contextColorScheme ?? colorScheme;
}
