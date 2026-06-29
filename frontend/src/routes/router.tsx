import { NavigationContainer } from "@react-navigation/native";
import { AuthNavigator } from "./authnavigator";
import { AppNavigator } from "./appnavigator";
import { useAuth } from "../shared/contexts/authcontext";

export const Router = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
