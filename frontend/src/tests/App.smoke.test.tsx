import React from "react";
import { render } from "@testing-library/react-native";

jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock("@expo-google-fonts/poppins", () => ({
  useFonts: () => [true],
}));

jest.mock("@sentry/react-native", () => ({
  init: jest.fn(),
  wrap: (Comp: any) => Comp,
  mobileReplayIntegration: jest.fn(),
  feedbackIntegration: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const MOCK_INITIAL_METRICS = {
    frame: { x: 0, y: 0, width: 0, height: 0 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
  };
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: ({ children }: any) => children,
    SafeAreaContext: React.createContext(MOCK_INITIAL_METRICS),
    useSafeAreaInsets: jest.fn(() => MOCK_INITIAL_METRICS.insets),
    useSafeAreaFrame: jest.fn(() => MOCK_INITIAL_METRICS.frame),
    initialWindowMetrics: MOCK_INITIAL_METRICS,
  };
});

// mock react-navigation native and elements to avoid SafeAreaProviderCompat/useContext issues
jest.mock("@react-navigation/native", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    NavigationContainer: ({ children }: any) =>
      React.createElement(View, null, children),
    DefaultTheme: {},
    useNavigation: () => ({}),
    useIsFocused: () => false,
    createNavigatorFactory: jest.fn(() => jest.fn()),
  };
});

jest.mock("@react-navigation/native-stack", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    createNativeStackNavigator: jest.fn(() => ({
      Navigator: ({ children }: any) =>
        React.createElement(View, null, children),
      Screen: ({ children }: any) => children,
    })),
  };
});

jest.mock("@react-navigation/elements", () => {
  return {
    SafeAreaProviderCompat: ({ children }: any) => children,
  };
});

jest.mock("react-native-gesture-handler", () => {
  const View = require("react-native/Libraries/Components/View/View");
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
  };
});

jest.mock("react-native-reanimated", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: {
      call: () => {},
      timing: () => ({ start: () => {} }),
      spring: () => ({ start: () => {} }),
      Value: React.Component,
      createAnimatedComponent: (comp: any) => comp,
    },
  };
});

jest.mock("@react-native-firebase/app", () => {
  return {
    __esModule: true,
    default: {
      app: jest.fn(() => ({
        utils: jest.fn(() => ({})),
      })),
      apps: [],
    },
  };
});

jest.mock("@react-native-firebase/analytics", () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      logEvent: jest.fn(),
      setAnalyticsCollectionEnabled: jest.fn(),
      setUserId: jest.fn(),
      setUserProperties: jest.fn(),
    })),
  };
});

jest.mock("../../src/navigation/AppNavigator", () => {
  const React = require("react");
  const { View } = require("react-native");
  return () => React.createElement(View, { testID: "mock-nav" });
});

import App from "../../App";

describe("App (smoke)", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation((...args) => {
      const msg = args.join(" ");
      if (msg.includes("AggregateError") || msg.includes("Warning:")) return;
    });
  });

  it("renders without crashing", () => {
    const { toJSON, getByTestId } = render(<App />);
    expect(toJSON()).toBeTruthy();
    expect(getByTestId("mock-nav")).toBeDefined();
  });
  it("renders without crashing (second check)", () => {
    const { toJSON } = render(<App />);
    expect(toJSON()).toBeTruthy();
  });

  it("renders mock nav element", () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId("mock-nav")).toBeDefined();
  });

  for (let i = 1; i <= 8; i++) {
    it(`renders without crashing (iteration ${i})`, () => {
      const { toJSON } = render(<App />);
      expect(toJSON()).toBeTruthy();
    });
  }
});
