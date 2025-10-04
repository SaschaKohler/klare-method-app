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
        // Return defaultValue if provided, otherwise use translations map
        if (options && 'defaultValue' in options) {
          return options.defaultValue as string;
        }

        const translations: Record<string, string> = {
          loading: 'Wird geladen...',
          'common:status.loading': 'Wird geladen...',
          'home:loading': 'Wird geladen...',
          'home:sections.klareMethod': 'KLARE Methode',
          'home:sections.nextActivities.title': 'Nächste Aktivitäten',
          'home:progress.viewLifeWheel': 'Lebensrad ansehen',
          'home:anonymousUser': 'Gast',
          'home:errors.summaryNotAvailable': 'Zusammenfassung derzeit nicht verfügbar',
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
      areas: [
        {
          id: 'area-1',
          areaKey: 'health',
          name: 'Gesundheit',
          currentValue: 3,
          targetValue: 8,
        },
      ],
      average: 50,
      lowestAreas: [
        {
          id: 'area-1',
          areaKey: 'health',
          name: 'Gesundheit',
          currentValue: 3,
          targetValue: 8,
        },
      ],
      highestAreas: [],
      gapAreas: [],
    },
    resources: {
      count: 0,
      byCategory: {
        physical: 0,
        mental: 0,
        emotional: 0,
        spiritual: 0,
        social: 0,
      },
      topResources: [],
      recentlyActivated: [],
    },
    journal: {
      totalEntries: 0,
      favoriteEntries: 0,
      entriesByMonth: {},
      lastEntryDate: null,
      averageMoodRating: null,
      averageClarityRating: null,
    },
  },
  theme: {
    isDarkMode: false,
  },
  progression: {
    completedModules: ['k-intro'],
    getDaysInProgram: jest.fn().mockReturnValue(7),
    getAvailableModules: jest.fn().mockReturnValue(['k-intro']),
    getModuleProgress: jest.fn().mockReturnValue(80),
    getCurrentStage: jest.fn().mockReturnValue({ id: 'K', name: 'Klarheit' }),
    getNextStage: jest.fn().mockReturnValue({ id: 'L', name: 'Lebendigkeit' }),
    isModuleAvailable: jest.fn().mockReturnValue(true),
    getModuleDetails: jest.fn().mockReturnValue({
      id: 'k-intro',
      step: 'K',
      completed: false,
      available: true,
      unlockDate: null,
      daysUntilUnlock: -1,
    }),
    getStepProgressPercentage: jest.fn().mockReturnValue(80),
    completeModule: jest.fn(),
  },
  lifeWheel: {
    areas: [],
    updateArea: jest.fn(),
    average: 50,
    loadLifeWheelData: jest.fn().mockResolvedValue(undefined),
    findLowestAreas: jest.fn().mockReturnValue([]),
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

  describe('Snapshot Tests', () => {
    it('matches snapshot when loading', () => {
      const { toJSON } = renderHomeScreen({ isLoading: true });
      expect(toJSON()).toMatchSnapshot();
    });

    it('matches snapshot with full data', () => {
      const { toJSON } = renderHomeScreen();
      expect(toJSON()).toMatchSnapshot();
    });

    it('matches snapshot when summary is missing', () => {
      const { toJSON } = renderHomeScreen({
        summary: undefined as any,
      });
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('Store Integration', () => {
    it('renders with different loading states', () => {
      const loadingRender = renderHomeScreen({ isLoading: true });
      expect(loadingRender.toJSON()).toBeTruthy();
      
      const loadedRender = renderHomeScreen({ isLoading: false });
      expect(loadedRender.toJSON()).toBeTruthy();
    });

    it('renders with different summary states', () => {
      const withSummary = renderHomeScreen();
      expect(withSummary.toJSON()).toBeTruthy();
      
      const withoutSummary = renderHomeScreen({ summary: undefined as any });
      expect(withoutSummary.toJSON()).toBeTruthy();
    });
  });
});
