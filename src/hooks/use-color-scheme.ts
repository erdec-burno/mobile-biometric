import { type PropsWithChildren, createContext, createElement, useContext, useEffect, useState } from 'react';
import { AppState, Appearance, useColorScheme as useReactNativeColorScheme } from 'react-native';

type ColorScheme = ReturnType<typeof useReactNativeColorScheme>;

const ColorSchemeContext = createContext<ColorScheme | undefined>(undefined);

/**
 * Keeps the color scheme in sync when the app returns from the background.
 */
export function ColorSchemeProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useReactNativeColorScheme();
  const [colorScheme, setColorScheme] = useState<ColorScheme>(systemColorScheme);

  useEffect(() => {
    setColorScheme(systemColorScheme);
  }, [systemColorScheme]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        setColorScheme(Appearance.getColorScheme() ?? systemColorScheme);
      }
    });

    return () => subscription.remove();
  }, [systemColorScheme]);

  return createElement(ColorSchemeContext.Provider, { value: colorScheme }, children);
}

export function useColorScheme() {
  const systemColorScheme = useReactNativeColorScheme();
  const contextColorScheme = useContext(ColorSchemeContext);

  return contextColorScheme ?? systemColorScheme;
}
