export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;

  MainTabs: undefined;
  AddTransaction: undefined; //+

  // màn hình detail của Budget Category
  BudgetCategoryDetail: { categoryId: string };
  BudgetCategoryForm: { categoryId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Report: undefined;
  Add: undefined;
  Budget: undefined;
  Profile: undefined;
};
