import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// ---- Pilha de autenticação (deslogado) ----
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

// ---- Pilha Explorar ----
export type ExploreStackParamList = {
  Explore: undefined;
  BookDetail: { bookId: string };
};

// ---- Pilha Perfil ----
export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  BookDetail: { bookId: string };
  Lists: undefined;
  ListDetail: { listId: string };
  Stats: undefined;
  YearSummary: { year: number };
};

// ---- Abas ----
export type AppTabsParamList = {
  ExploreTab: NavigatorScreenParams<ExploreStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// ---- Pilha raiz (abas + modais) ----
export type ShareCardParams = {
  variant: 'reading' | 'year';
  title: string;
  subtitle: string;
  coverUrl: string | null;
  rating: number | null;
  username: string;
  stats?: { label: string; value: string }[];
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<AppTabsParamList>;
  ReadingModal: { bookId: string };
  AddBookToList: { listId: string };
  ShareCard: ShareCardParams;
};

// ---- Props de tela (compostas, para navegar entre níveis) ----
export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type ExploreScreenProps<T extends keyof ExploreStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ExploreStackParamList, T>,
  CompositeScreenProps<
    BottomTabScreenProps<AppTabsParamList, 'ExploreTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type ProfileScreenProps<T extends keyof ProfileStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, T>,
  CompositeScreenProps<
    BottomTabScreenProps<AppTabsParamList, 'ProfileTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;
