import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import HomeScreen, { RootStackParamList } from '../HomeScreen';
import { useKlareStores } from '../../hooks';

jest.mock('../../components', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    KlareMethodCards: () => React.createElement(View, { testID: 'klare-method-cards' }),
  };
});

jest.mock('react-i18next', () => {
  const actual = jest.requireActual('react-i18next');

  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, options?: Record<string, unknown>) => {
        const translations: Record<string, string> = {
          loading: 'Wird geladen...',
          'common:status.loading': 'Wird geladen...',
          'home:loading': 'Wird geladen...',
          'home:sections.klareMethod': 'KLARE Methode',
          'home:sections.nextActivities.title': 'Nächste Aktivitäten',
          'home:progress.viewLifeWheel': 'Lebensrad ansehen',
        };

        if (translations[key]) {
          return translations[key];
        }

        if (key === 'home:progression.program' && options?.days !== undefined) {
          return `KLARE Programm - Tag ${options.days}`;
        }

        if (key === 'home:progression.phase' && options?.id) {
          return `Phase ${options.id}`;
        }

        return key;
      },
      i18n: { language: 'de' },
    }),
  };
});

type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>;

jest.mock('../../hooks', () => ({
  useKlareStores: jest.fn(),
}));

const mockedUseKlareStores = useKlareStores as jest.MockedFunction<typeof useKlareStores>;

const baseStoreMock = {
  summary: {
    user: {
      name: 'Testperson',
      daysInProgram: 7,
      currentStage: {
        id: 'K',
        name: 'Klarheit',
        description: 'Beschreibung Klarheit',
        requiredDays: 0,
      },
      nextStage: {
        id: 'L',
        name: 'Lebendigkeit',
        description: 'Beschreibung Lebendigkeit',
        requiredDays: 14,
      },
      streak: 3,
    },
    modules: {
      total: 35,
      k: 80,
      l: 60,
      a: 40,
      r: 20,
      e: 10,
      available: ['k-intro', 'k-meta-model'],
      completed: ['k-intro'],
      currentStage: {
        id: 'K',
        name: 'Klarheit',
        description: 'Beschreibung Klarheit',
      },
      nextStage: {
        id: 'L',
        name: 'Lebendigkeit',
        description: 'Beschreibung Lebendigkeit',
        requiredDays: 14,
      },
    },
    lifeWheel: {
      average: 50,
      lowestAreas: [
        {
          id: 'area-1',
          areaKey: 'health',
          name: 'Gesundheit',
          currentValue: 3,
        },
      ],
    },
    resources: {},
    journal: {},
  },
  theme: {
    isDarkMode: false,
  },
  progression: {
    getDaysInProgram: jest.fn().mockReturnValue(7),
    getAvailableModules: jest.fn().mockReturnValue(['k-intro']),
    getModuleProgress: jest.fn(),
    getCurrentStage: jest.fn(),
    getNextStage: jest.fn(),
    isModuleAvailable: jest.fn().mockReturnValue(true),
    completeModule: jest.fn(),
  },
  lifeWheel: {
    loadLifeWheelData: jest.fn().mockResolvedValue(undefined),
    findLowestAreas: jest.fn(),
  },
  analytics: {
    recommendations: {
      dailyTip: 'Individueller Tipp',
    },
  },
  isLoading: false,
  user: {
    id: 'user-1',
    user_metadata: {
      avatar_url: null,
    },
  },
};

const createStoreMock = (
  overrides: Partial<typeof baseStoreMock> = {},
): typeof baseStoreMock => ({
  ...baseStoreMock,
  ...overrides,
  summary: {
    ...baseStoreMock.summary,
    ...overrides.summary,
    user: {
      ...baseStoreMock.summary.user,
      ...(overrides.summary?.user ?? {}),
    },
    modules: {
      ...baseStoreMock.summary.modules,
      ...(overrides.summary?.modules ?? {}),
    },
    lifeWheel: {
      ...baseStoreMock.summary.lifeWheel,
      ...(overrides.summary?.lifeWheel ?? {}),
    },
    resources: {
      ...baseStoreMock.summary.resources,
      ...(overrides.summary?.resources ?? {}),
    },
    journal: {
      ...baseStoreMock.summary.journal,
      ...(overrides.summary?.journal ?? {}),
    },
  },
  theme: {
    ...baseStoreMock.theme,
    ...(overrides.theme ?? {}),
  },
  progression: {
    ...baseStoreMock.progression,
    ...(overrides.progression ?? {}),
  },
  lifeWheel: {
    ...baseStoreMock.lifeWheel,
    ...(overrides.lifeWheel ?? {}),
  },
  analytics: {
    ...baseStoreMock.analytics,
    ...(overrides.analytics ?? {}),
  },
});

const createNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
}) as unknown as HomeScreenProps['navigation'];

const createRoute = () => ({
  key: 'Home',
  name: 'Home',
}) as HomeScreenProps['route'];

const renderHomeScreen = (storeOverrides?: Partial<typeof baseStoreMock>) => {
  const mockedStore = createStoreMock(storeOverrides);
  mockedUseKlareStores.mockReturnValue(mockedStore as unknown as ReturnType<typeof useKlareStores>);

  const navigation = createNavigation();
  const route = createRoute();

  const utils = render(
    <SafeAreaProvider>
      <PaperProvider>
        <HomeScreen navigation={navigation} route={route} />
      </PaperProvider>
    </SafeAreaProvider>,
  );

  return {
    ...utils,
    navigation,
  };
};

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('zeigt einen Ladezustand, wenn die Stores noch laden', () => {
    const { getByText } = renderHomeScreen({ isLoading: true });

    expect(getByText('Wird geladen...')).toBeTruthy();
  });

  it('rendert die Hauptbereiche und unterstützt Navigation zum Lebensrad', () => {
    const { getByText, navigation } = renderHomeScreen();

    expect(getByText('KLARE Methode')).toBeTruthy();
    expect(getByText('Nächste Aktivitäten')).toBeTruthy();

    fireEvent.press(getByText('Lebensrad ansehen'));

    expect(navigation.navigate).toHaveBeenCalledWith('LifeWheel');
  });
});
