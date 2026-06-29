import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

import { ILoginInput, IUserCreate, IUserResponse } from "../interfaces";

import { authService } from "../services/authservice";
import { authStorage } from "../utils";

interface AuthContextData {
  user: IUserResponse | null;

  token: string | null;

  loading: boolean;

  signIn(data: ILoginInput): Promise<Error | void>;

  signUp(data: IUserCreate): Promise<Error | void>;

  logout(): Promise<void>;
}

export const AuthContext = createContext({} as AuthContextData);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<IUserResponse | null>(null);

  const [token, setToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  async function loadUser() {
    const storedUser = await authStorage.getUser();

    const storedToken = await authStorage.getToken();

    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function signIn(data: ILoginInput) {
    const response = await authService.login(data);

    if (response instanceof Error) {
      return response;
    }

    await authStorage.saveToken(response.access_token);

    setToken(response.access_token);

    return;
  }

  async function signUp(data: IUserCreate) {
    const response = await authService.register(data);

    if (response instanceof Error) {
      return response;
    }

    await authStorage.saveToken(response.access_token);

    await authStorage.saveUser(response.user);

    setUser(response.user);

    setToken(response.access_token);

    return;
  }

  async function logout() {
    await authStorage.clear();

    setUser(null);

    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signIn,
        signUp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
