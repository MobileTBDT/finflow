import React from "react";
import { render } from "@testing-library/react-native";
import HomeScreen from "../HomeScreen";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock("../../assets/noti.png", () => "noti.png");
jest.mock("../../assets/food.png", () => "food.png");
jest.mock("../../assets/grocery.png", () => "grocery.png");
jest.mock("../../assets/transportation.png", () => "transportation.png");

// Helpers to traverse the rendered tree
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
function nodesWithProp(tree: any, predicate: (props: any) => boolean) {
  const out: any[] = [];
  walk(tree, (n) => {
    if (n && n.props && predicate(n.props)) out.push(n);
  });
  return out;
}

describe("HomeScreen (basic)", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<HomeScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it("shows header text", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("Hi, Welcome Back")).toBeTruthy();
  });

  it("renders notification asset string somewhere", () => {
    const { toJSON } = render(<HomeScreen />);
    const imgs = nodesByType(toJSON(), "Image");
    expect(imgs.length).toBeGreaterThanOrEqual(1);
    const hasMockedAsset = imgs.some(
      (img) =>
        typeof img.props?.source === "string" &&
        img.props.source.endsWith(".png")
    );
    expect(hasMockedAsset).toBeTruthy();
  });

  it("shows total income value", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("$7,783.00")).toBeTruthy();
  });

  it("shows total expense value", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("$1,187.40")).toBeTruthy();
  });

  it("shows donut center value", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("$ 7,783")).toBeTruthy();
  });

  it("shows chart month", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("April, 2024")).toBeTruthy();
  });

  it("renders legend labels (each at least once)", () => {
    const { getAllByText } = render(<HomeScreen />);
    [
      "Food",
      "Groceries",
      "Transportation",
      "Entertainment",
      "Health care",
      "Saving",
    ].forEach((label) => {
      expect(getAllByText(label).length).toBeGreaterThanOrEqual(1);
    });
  });

  it("renders category rows titles", () => {
    const { getAllByText } = render(<HomeScreen />);
    expect(getAllByText("Food").length).toBeGreaterThanOrEqual(1);
    expect(getAllByText("Groceries").length).toBeGreaterThanOrEqual(1);
    expect(getAllByText("Transportation").length).toBeGreaterThanOrEqual(1);
  });

  it("renders category amounts", () => {
    const { getAllByText, getByText } = render(<HomeScreen />);
    expect(getAllByText("$2.800").length).toBeGreaterThanOrEqual(1);
    expect(getByText("$400")).toBeTruthy();
  });

  it("renders category subtexts", () => {
    const { getAllByText } = render(<HomeScreen />);
    expect(getAllByText("13 Days Off").length).toBeGreaterThanOrEqual(1);
  });

  it("contains a ScrollView in the tree", () => {
    const { toJSON } = render(<HomeScreen />);
    const tree = toJSON();
    // find any node whose type contains "Scroll" (robust against platform differences)
    const found = [];
    walk(tree, (n) => {
      if (
        n &&
        typeof n.type === "string" &&
        n.type.toLowerCase().includes("scroll")
      )
        found.push(n);
    });
    expect(found.length).toBeGreaterThanOrEqual(1);
  });

  it("has at least one Image node", () => {
    const { toJSON } = render(<HomeScreen />);
    const imgs = nodesByType(toJSON(), "Image");
    expect(imgs.length).toBeGreaterThanOrEqual(1);
  });

  it("has at least one interactive element (onPress present)", () => {
    const { toJSON } = render(<HomeScreen />);
    const interactive = nodesWithProp(
      toJSON(),
      (p) =>
        typeof p.onPress === "function" ||
        p.accessible === true ||
        p.focusable === true
    );
    expect(interactive.length).toBeGreaterThanOrEqual(1);
  });

  it("smoke: rendering remains stable (no-op press not required)", () => {
    const { toJSON } = render(<HomeScreen />);
    expect(toJSON()).toBeTruthy();
  });
});
