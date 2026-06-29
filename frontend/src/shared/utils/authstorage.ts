import AsyncStorage from "@react-native-async-storage/async-storage";

import { IUserResponse } from "../interfaces";

const storageKeys = {
  TOKEN: "@bookshelf:token",
  USER: "@bookshelf:user",
} as const;

const saveToken = async (token: string) => {
  await AsyncStorage.setItem(storageKeys.TOKEN, token);
};

const getToken = async () => {
  return AsyncStorage.getItem(storageKeys.TOKEN);
};

const removeToken = async () => {
  await AsyncStorage.removeItem(storageKeys.TOKEN);
};

const saveUser = async (user: IUserResponse) => {
  await AsyncStorage.setItem(storageKeys.USER, JSON.stringify(user));
};

const getUser = async (): Promise<IUserResponse | null> => {
  const data = await AsyncStorage.getItem(storageKeys.USER);

  if (!data) {
    return null;
  }

  return JSON.parse(data);
};

const removeUser = async () => {
  await AsyncStorage.removeItem(storageKeys.USER);
};

const clear = async () => {
  await AsyncStorage.multiRemove([storageKeys.TOKEN, storageKeys.USER]);
};

export const authStorage = {
  saveToken,
  getToken,
  removeToken,
  saveUser,
  getUser,
  removeUser,
  clear,
};
