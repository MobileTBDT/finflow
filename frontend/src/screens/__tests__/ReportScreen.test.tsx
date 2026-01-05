import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ReportScreen from "../ReportScreen";

const mockNav = {
  canGoBack: jest.fn(() => false),
  goBack: jest.fn(),
};

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => mockNav,
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

// mock images used by the screen
jest.mock("../../assets/noti.png", () => "noti.png");
jest.mock("../../assets/food.png", () => "food.png");
jest.mock("../../assets/shopping.png", () => "shopping.png");
jest.mock("../../assets/health.png", () => "health.png");
jest.mock("../../assets/grocery.png", () => "grocery.png");
jest.mock("../../assets/transportation.png", () => "transportation.png");
jest.mock("../../assets/utilities.png", () => "utilities.png");

// helpers to walk rendered tree
function walk(node: any, cb: (n: any) => void) {
  if (!node) return;
  cb(node);
  const children = node.children || node.props?.children;
  if (Array.isArray(children)) {
    children.forEach((c) => walk(c, cb));
  } else if (children) {
    walk(children, cb);
  }
}
function nodesByType(tree: any, type: string) {
  const out: any[] = [];
  walk(tree, (n) => {
    if (n && n.type === type) out.push(n);
  });
  return out;
}

describe("ReportScreen (basic)", () => {
  beforeEach(() => {
    mockNav.canGoBack.mockReturnValue(false);
    mockNav.goBack.mockClear();
  });

  it("renders without crashing", () => {
    const { toJSON } = render(<ReportScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it("shows header title", () => {
    const { getByText } = render(<ReportScreen />);
    expect(getByText("Report")).toBeTruthy();
  });

  it("shows segmented controls", () => {
    const { getByText } = render(<ReportScreen />);
    expect(getByText("Weekly")).toBeTruthy();
    expect(getByText("Monthly")).toBeTruthy();
  });

  it("shows weekly chart max label by default", () => {
    const { getByText } = render(<ReportScreen />);
    expect(getByText("$4k")).toBeTruthy();
  });

  it("switches to monthly mode when pressing Monthly", () => {
    const { getByText } = render(<ReportScreen />);
    fireEvent.press(getByText("Monthly"));
    expect(getByText("$80")).toBeTruthy();
    expect(getByText("Under budget")).toBeTruthy();
  });

  it("back button does not call goBack when canGoBack is false", () => {
    const { getByText } = render(<ReportScreen />);
    fireEvent.press(getByText("←"));
    expect(mockNav.goBack).not.toHaveBeenCalled();
  });

  it("back button calls goBack when canGoBack is true", () => {
    mockNav.canGoBack.mockReturnValue(true);
    const { getByText } = render(<ReportScreen />);
    fireEvent.press(getByText("←"));
    expect(mockNav.goBack).toHaveBeenCalled();
  });

  it("renders bar chart and tooltip appears after pressing a bar", () => {
    const { getByText } = render(<ReportScreen />);
    // press Monday bar ("M")
    const monday = getByText("M");
    fireEvent.press(monday);
    // monday tooltip is $0.9K in weeklyPoints
    expect(getByText("$0.9K")).toBeTruthy();
  });

  it("renders report list titles", () => {
    const { getAllByText } = render(<ReportScreen />);
    [
      "Food",
      "Shopping",
      "Health Care",
      "Groceries",
      "Transportation",
      "Utilities",
    ].forEach((t) => {
      expect(getAllByText(t).length).toBeGreaterThanOrEqual(1);
    });
  });

  it("notification image uses a mocked asset string", () => {
    const { toJSON } = render(<ReportScreen />);
    const imgs = nodesByType(toJSON(), "Image");
    const hasMocked = imgs.some(
      (img) =>
        typeof img.props?.source === "string" &&
        img.props.source.endsWith(".png")
    );
    expect(hasMocked).toBeTruthy();
  });

  it("renders chart y-axis values", () => {
    const { getByText } = render(<ReportScreen />);
    expect(getByText("$3k")).toBeTruthy();
    expect(getByText("$2k")).toBeTruthy();
    expect(getByText("$1k")).toBeTruthy();
  });

  it("selected guide and tooltip render for default selected key", () => {
    const { getByText } = render(<ReportScreen />);
    // default selected point is fr -> tooltip $3.2K
    expect(getByText("$3.2K")).toBeTruthy();
  });
});
