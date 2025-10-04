import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';
import React from 'react';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  Reanimated.default.call = () => {};

  return Reanimated;
});

jest.mock(
  'react-native/Libraries/Animated/NativeAnimatedHelper',
  () => ({}),
  { virtual: true },
);

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-mmkv', () => {
  const actual = jest.requireActual('react-native-mmkv');

  class MockMMKV {
    private storage = new Map<string, string>();

    getString(key: string) {
      return this.storage.get(key) ?? null;
    }

    set(key: string, value: string) {
      this.storage.set(key, value);
    }

    delete(key: string) {
      this.storage.delete(key);
    }
  }

  return {
    ...actual,
    MMKV: MockMMKV,
    useMMKVNumber: jest.fn(),
    useMMKVString: jest.fn(),
    useMMKVObject: jest.fn(),
  };
});

jest.mock('expo-linking', () => {
  const actualExpoLinking = jest.requireActual<typeof import('expo-linking')>('expo-linking');
  return {
    ...actualExpoLinking,
    openURL: jest.fn(),
    createURL: jest.fn().mockImplementation((path: string) => `app:///${path}`),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  };
});

jest.mock('expo-asset', () => {
  const actualExpoAsset = jest.requireActual<typeof import('expo-asset')>('expo-asset');
  return {
    ...actualExpoAsset,
    loadAsync: jest.fn(),
  };
});

jest.mock('expo-font', () => {
  const actualExpoFont = jest.requireActual<typeof import('expo-font')>('expo-font');
  return {
    ...actualExpoFont,
    loadAsync: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock('expo-haptics', () => {
  const actualExpoHaptics = jest.requireActual<typeof import('expo-haptics')>('expo-haptics');
  return {
    ...actualExpoHaptics,
    impactAsync: jest.fn(),
    notificationAsync: jest.fn(),
    selectionAsync: jest.fn(),
  };
});

jest.mock('react-native-gesture-handler', () => {
  const actualGestureHandler = jest.requireActual<typeof import('react-native-gesture-handler')>('react-native-gesture-handler');
  return {
    ...actualGestureHandler,
    GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
  };
});

beforeAll(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});
