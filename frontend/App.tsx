import { AuthProvider } from "./src/shared/contexts/authcontext";
import { Router } from "./src/routes";

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
