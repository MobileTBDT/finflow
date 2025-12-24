export type BudgetCategoryId =
  | "food"
  | "grocery"
  | "transport"
  | "utilities"
  | "rent"
  | "personal"
  | "health"
  | "sport"
  | "gift"
  | "saving"
  | "travel"
  | "shopping";

export type BudgetCategoryMeta = {
  id: BudgetCategoryId;
  label: string;
  image: any;
};

export const BUDGET_CATEGORIES: BudgetCategoryMeta[] = [
  { id: "food", label: "Food", image: require("../../assets/food.png") },
  {
    id: "grocery",
    label: "Grocery",
    image: require("../../assets/grocery.png"),
  },
  {
    id: "transport",
    label: "Transportation",
    image: require("../../assets/transportation.png"),
  },
  {
    id: "utilities",
    label: "Utilities",
    image: require("../../assets/utilities.png"),
  },

  { id: "rent", label: "Rent", image: require("../../assets/rent.png") },
  {
    id: "personal",
    label: "Personal",
    image: require("../../assets/personal.png"),
  },
  { id: "health", label: "Health", image: require("../../assets/health.png") },
  { id: "sport", label: "Sport", image: require("../../assets/sport.png") },

  { id: "gift", label: "Gift", image: require("../../assets/gift.png") },
  { id: "saving", label: "Saving", image: require("../../assets/saving.png") },
  { id: "travel", label: "Travel", image: require("../../assets/travel.png") },
  {
    id: "shopping",
    label: "Shopping",
    image: require("../../assets/shopping.png"),
  },
];

export function getBudgetCategory(categoryId: string) {
  return BUDGET_CATEGORIES.find((c) => c.id === categoryId);
}
