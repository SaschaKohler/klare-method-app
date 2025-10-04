import { beforeEach, describe, expect, jest, test } from "@jest/globals";

jest.mock("react-native", () => {
  const actual = jest.requireActual("react-native") as typeof import("react-native");
  return {
    ...actual,
    Appearance: {
      ...actual.Appearance,
      getColorScheme: jest.fn(() => "light"),
    },
  };
});

import { Appearance } from "react-native";
import { useThemeStore } from "../useThemeStore";

const getColorSchemeMock = Appearance.getColorScheme as jest.MockedFunction<typeof Appearance.getColorScheme>;

const resetThemeStore = (scheme: "light" | "dark" = "light") => {
  getColorSchemeMock.mockReturnValue(scheme);
  useThemeStore.setState((state) => ({
    ...state,
    isDarkMode: scheme === "dark",
    isSystemTheme: true,
    metadata: {
      ...state.metadata,
      isLoading: false,
      error: null,
    },
  }));
};

describe("useThemeStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetThemeStore();
  });

  test("toggleTheme setzt Dark Mode um und deaktiviert Systemmodus", () => {
    const { toggleTheme } = useThemeStore.getState();

    toggleTheme();

    const state = useThemeStore.getState();
    expect(state.isDarkMode).toBe(true);
    expect(state.isSystemTheme).toBe(false);
  });

  test("setSystemTheme übernimmt Systemfarbschema", () => {
    const { setSystemTheme } = useThemeStore.getState();

    getColorSchemeMock.mockReturnValueOnce("dark");
    setSystemTheme(true);

    const state = useThemeStore.getState();
    expect(state.isSystemTheme).toBe(true);
    expect(state.isDarkMode).toBe(true);
  });

  test("setSystemTheme(false) behält aktuellen Zustand bei", () => {
    const { setSystemTheme } = useThemeStore.getState();

    resetThemeStore("dark");
    setSystemTheme(false);

    const state = useThemeStore.getState();
    expect(state.isSystemTheme).toBe(false);
    expect(state.isDarkMode).toBe(true);
  });

  test("getActiveTheme liefert Dark Mode basierend auf System", () => {
    resetThemeStore();
    const { getActiveTheme, setSystemTheme } = useThemeStore.getState();

    getColorSchemeMock.mockReturnValueOnce("dark");
    setSystemTheme(true);

    expect(getActiveTheme()).toBe(true);

    getColorSchemeMock.mockReturnValueOnce("light");
    expect(getActiveTheme()).toBe(false);
  });
});
