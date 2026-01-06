export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;

  MainTabs: undefined;
  AddTransaction: undefined; //+

  // màn hình detail của Budget Category
  BudgetCategoryDetail: {
    categoryId: string;
    categoryMeta?: any;
  };
  BudgetCategoryForm: { categoryId: string };
  EditProfile: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Report: undefined;
  Add: undefined;
  Budget: undefined;
  Profile: undefined;
};
