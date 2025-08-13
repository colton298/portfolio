import { ReactNode, useEffect, useState, createContext, useContext } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // console.log LOCATION #A1: auth subscription install
    console.log("[AuthProvider] subscribe onAuthStateChanged");
    const unsub = onAuthStateChanged(auth, (u) => {
      // console.log LOCATION #A2: auth state update
      console.log("[AuthProvider] onAuthStateChanged user:", u?.uid, "verified:", u?.emailVerified);
      setUser(u);
      setLoading(false);
    });
    return () => {
      // console.log LOCATION #A3: cleanup subscription
      console.log("[AuthProvider] unsubscribe onAuthStateChanged");
      unsub();
    };
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
