import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type RootStackParamList = {
  Home: undefined;

  BookDetail: {
    id: string;
  };

  Profile: {
    userId: string;
  };
};

export type AppNavigation = NativeStackNavigationProp<RootStackParamList>;

export type AuthNavigation = NativeStackNavigationProp<AuthStackParamList>;
