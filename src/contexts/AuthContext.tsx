import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "teacher" | "user";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  isTeacher: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const initializedRef = useRef(false);

  const fetchRoles = async (userId: string): Promise<AppRole[]> => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching roles:", error);
        return [];
      }

      return (data?.map((r) => r.role as AppRole) || []);
    } catch (err) {
      console.error("Error in fetchRoles:", err);
      return [];
    }
  };

  const refreshRoles = async () => {
    if (user) {
      const userRoles = await fetchRoles(user.id);
      setRoles(userRoles);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener for ONGOING changes (not initial load)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        // Skip if this is the initial load - handled by initializeAuth
        if (!initializedRef.current) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch roles without blocking
          const userRoles = await fetchRoles(session.user.id);
          if (isMounted) {
            setRoles(userRoles);
          }
        } else {
          setRoles([]);
        }
      }
    );

    // INITIAL load - controls loading state
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        // Fetch roles BEFORE setting loading to false
        if (session?.user) {
          const userRoles = await fetchRoles(session.user.id);
          if (isMounted) {
            setRoles(userRoles);
          }
        }
      } catch (error) {
        console.error("Error during initial auth setup:", error);
        if (isMounted) {
          setUser(null);
          setSession(null);
          setRoles([]);
        }
      } finally {
        if (isMounted) {
          initializedRef.current = true;
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // After successful sign in, immediately fetch roles
      if (!error && data.user) {
        const userRoles = await fetchRoles(data.user.id);
        setRoles(userRoles);
        setUser(data.user);
        setSession(data.session);
      }
      
      return { error: error as Error | null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            display_name: displayName || email,
          },
        },
      });
      return { error: error as Error | null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRoles([]);
    setUser(null);
    setSession(null);
  };

  const isTeacher = roles.includes("teacher") || roles.includes("admin");
  const isAdmin = roles.includes("admin");

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        roles,
        isTeacher,
        isAdmin,
        signIn,
        signUp,
        signOut,
        refreshRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
