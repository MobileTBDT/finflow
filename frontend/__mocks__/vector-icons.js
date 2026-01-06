import React from "react";
import { Text } from "react-native";

const createIconSet = () => {
  return (props) => <Text {...props}>{props.name || "Icon"}</Text>;
};

export const MaterialIcons = createIconSet();
export const Ionicons = createIconSet();
export const FontAwesome5 = createIconSet();
export const AntDesign = createIconSet();
export const Feather = createIconSet();

export default {
  MaterialIcons,
  Ionicons,
  FontAwesome5,
  AntDesign,
  Feather,
};
