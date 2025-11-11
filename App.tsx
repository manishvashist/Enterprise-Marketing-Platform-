
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { authService } from './services/authService';
import { subscriptionService } from './services/subscriptionService';
import { User } from './types';
import { AuthPage } from './components/auth/AuthPage';
import { MainApp } from './components/MainApp';
import { LandingPage } from './components/landing/LandingPage';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';

const SupabaseConfigurationNotice: React.FC = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-center">
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-red-400">Backend Configuration Required</h1>
      <p className="mt-2 text-gray-300">
        The application cannot connect to the backend because the Supabase environment variables are not set.
      </p>
      <div className="mt-4 text-left bg-gray-800 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400">
             Please provide your Supabase credentials. In a typical setup, you would create a <code className="bg-gray-700 text-yellow-300 px-2 py-1 rounded">.env</code> file with the following:
          </p>
          <pre className="mt-2 text-gray-300 bg-gray-900 p-3 rounded-md">
            <code>
              NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"<br />
              NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="YOUR_SUPABASE_KEY"
            </code>
          </pre>
          <p className="mt-2 text-gray-400">
            Replace the placeholder values with your actual Supabase project credentials.
          </p>
      </div>
       <p className="mt-4 text-sm text-gray-500">
            You can find these in your Supabase project dashboard under Project Settings &gt; API. After setting them, please restart your development server.
        </p>
    </div>
  </div>
);

const DatabaseSetupError: React.FC<{ error: string }> = ({ error }) => {
    const setupSql = `-- This script is idempotent and can be run multiple times safely.
-- It will DROP existing tables to ensure a clean setup.

-- 1. Drop existing objects in reverse order of dependency
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.campaigns;
DROP TABLE IF EXISTS public.user_subscriptions;
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.subscription_plans;

-- 2. Create subscription_plans table
CREATE TABLE public.subscription_plans (
  id text NOT NULL PRIMARY KEY,
  name text NOT NULL,
  plan_code text NOT NULL UNIQUE,
  monthly_price integer NOT NULL,
  billing_cycle_months integer NOT NULL,
  campaign_quota integer NOT NULL,
  quota_period_days integer NOT NULL,
  annual_price integer NOT NULL,
  annual_discount_percent integer NOT NULL,
  is_active boolean DEFAULT true NOT NULL
);
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access to active plans" ON public.subscription_plans FOR SELECT USING (is_active = true);

-- 3. Seed subscription_plans table
INSERT INTO public.subscription_plans (id, name, plan_code, monthly_price, billing_cycle_months, campaign_quota, quota_period_days, annual_price, annual_discount_percent, is_active)
VALUES
  ('plan_ind_1', 'Individual', 'individual', 10, 1, 10, 30, 96, 20, true),
  ('plan_smt_1', 'Small Team', 'small_team', 20, 1, 25, 30, 192, 20, true),
  ('plan_age_1', 'Agency', 'agency', 40, 1, 60, 30, 384, 20, true);

-- 4. Create the profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  full_name text,
  email text UNIQUE,
  role text DEFAULT 'User'::text NOT NULL,
  auth_provider text,
  channel_connections jsonb DEFAULT '{}'::jsonb NOT NULL,
  account_status text DEFAULT 'trial'::text NOT NULL,
  trial_start_date timestamptz,
  trial_end_date timestamptz,
  trial_campaigns_used integer DEFAULT 0 NOT NULL,
  active_subscription jsonb
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 5. Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES public.subscription_plans(id),
  billing_type text NOT NULL,
  status text NOT NULL,
  start_date timestamptz NOT NULL,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  next_billing_date timestamptz,
  cancellation_date timestamptz,
  campaigns_used_current_period integer DEFAULT 0 NOT NULL,
  campaign_quota integer NOT NULL,
  quota_reset_date timestamptz NOT NULL,
  auto_renew boolean DEFAULT true NOT NULL,
  UNIQUE(user_id, status)
);
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own subscriptions" ON public.user_subscriptions FOR ALL USING (auth.uid() = user_id);

-- 6. Create campaigns table
CREATE TABLE public.campaigns (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id uuid REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
    is_trial_campaign boolean DEFAULT false NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    name text NOT NULL,
    description text,
    audience_query text,
    estimated_size integer,
    key_attributes jsonb,
    kpis jsonb,
    strategy jsonb,
    governance_plan jsonb,
    channel_selection jsonb,
    channel_assets jsonb,
    nodes jsonb NOT NULL
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own campaigns." ON public.campaigns FOR ALL USING (auth.uid() = user_id);

-- 7. Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  trial_end_timestamp timestamptz;
BEGIN
  trial_end_timestamp := now() + interval '7 days';
  INSERT INTO public.profiles (id, full_name, email, auth_provider, trial_start_date, trial_end_date, channel_connections)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_app_meta_data->>'provider',
    now(),
    trial_end_timestamp,
    '{}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create trigger to call the function
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 9. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.subscription_plans TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.campaigns TO authenticated;`;

    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(setupSql).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }, (err) => {
            console.error('Could not copy text: ', err);
            alert('Failed to copy SQL script.');
        });
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-center">
            <div className="max-w-3xl bg-gray-800 p-8 rounded-lg border border-red-700 shadow-2xl">
                <h1 className="text-2xl font-bold text-red-400">Database Setup Incomplete</h1>
                <p className="mt-2 text-gray-300">
                    The application cannot start because one or more required database tables are missing or the setup is incomplete.
                </p>
                <p className="mt-1 text-sm text-red-400 font-mono bg-red-900/30 p-2 rounded">{error}</p>
                
                <div className="mt-6 text-left">
                    <h2 className="font-semibold text-white">Action Required:</h2>
                    <p className="text-gray-400 mt-2">
                        Please run the following SQL script in your Supabase project's SQL Editor to create and verify the necessary tables and functions.
                    </p>
                    <p className="text-gray-400 mt-1 text-sm">
                        Navigate to <span className="font-mono bg-gray-700 text-yellow-300 px-1 py-0.5 rounded">SQL Editor</span> in your Supabase dashboard and execute the entire script below. This script is now safe to run multiple times.
                    </p>

                    <div className="relative mt-4">
                        <pre className="bg-gray-900 text-gray-300 p-4 rounded-md text-xs overflow-x-auto h-64">
                            <code>
                                {setupSql}
                            </code>
                        </pre>
                        <button
                            onClick={copyToClipboard}
                            className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1 rounded-md text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
                        >
                            {copied ? 'Copied!' : 'Copy SQL'}
                        </button>
                    </div>

                    <p className="mt-4 text-gray-400 text-center">
                        After running the script, please <button onClick={() => window.location.reload()} className="font-semibold text-indigo-400 hover:underline">refresh this page</button>.
                    </p>
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  if (!isSupabaseConfigured || !supabase) {
    return <SupabaseConfigurationNotice />;
  }

  const [user, setUser] = useState<User | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [view, setView] = useState<'landing' | 'auth' | 'app'>('landing');
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [databaseError, setDatabaseError] = useState<string | null>(null);
  const isLoggingOutRef = useRef(false);

  const fetchUserWithSubscription = useCallback(async (baseUser: User): Promise<User> => {
    const subscription = await subscriptionService.getSubscriptionForUser(baseUser.id);
    return { ...baseUser, activeSubscription: subscription };
  }, []);

  useEffect(() => {
    if (globalSuccess) {
        const timer = setTimeout(() => setGlobalSuccess(null), 5000);
        return () => clearTimeout(timer);
    }
  }, [globalSuccess]);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          const fullUser = await fetchUserWithSubscription(user);
          setUser(fullUser);
          setView('app');
        } else {
          setView('landing');
        }
      } catch (err) {
        console.error("Initial Session Error:", err);
        const message = err instanceof Error ? err.message : "An unknown error occurred.";
        if (message.includes("Database setup incomplete")) {
            setDatabaseError(message);
        } else {
            setGlobalError(message);
        }
      } finally {
        setIsLoadingSession(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        // If a logout is in progress, ignore any intermediate events (like USER_UPDATED after a password change)
        // that might incorrectly try to log the user back in. Wait for the definitive SIGNED_OUT.
        if (isLoggingOutRef.current && event !== 'SIGNED_OUT') {
            return;
        }

        if (event === 'SIGNED_OUT') {
            isLoggingOutRef.current = false;
        }

        setGlobalError(null); 
        setDatabaseError(null);
        try {
            const currentUser = session ? await authService.getCurrentUser() : null;
            if (currentUser) {
                const fullUser = await fetchUserWithSubscription(currentUser);
                setUser(fullUser);
                setView('app');
            } else {
                setUser(null);
                setView('landing');
            }
        } catch (err) {
            console.error("Authentication Error:", err);
            const message = err instanceof Error ? err.message : "An unknown authentication error occurred.";
            if (message.includes("Database setup incomplete")) {
                setDatabaseError(message);
                if (session) await authService.logout(); // Prevent infinite loops
                setUser(null);
            } else {
                setGlobalError("An unexpected error occurred during login. Please try again.");
                if (session) await authService.logout();
                setUser(null);
                setView('landing');
            }
        } finally {
            // FIX: Corrected state setter function from setIsLoading to setIsLoadingSession.
            if (isLoadingSession) setIsLoadingSession(false);
        }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, []);

  const handleLogin = useCallback(async (loggedInUser: User) => {
    // onAuthStateChange will handle setting the user and view
  }, []);

  const handleLogout = useCallback(async () => {
    isLoggingOutRef.current = true;
    try {
      await authService.logout();
      // The onAuthStateChange listener is now the single source of truth for UI updates on logout.
      // This prevents race conditions between manual state updates here and listener-driven updates.
    } catch (err) {
      console.error("Logout failed:", err);
      setGlobalError("Logout failed. Please try again.");
      // If the logout API call fails, we must reset the flag to allow subsequent attempts.
      isLoggingOutRef.current = false;
    }
  }, [setGlobalError]);
  
  const handleUserUpdate = useCallback(async (updatedUser: User) => {
     const fullUser = await fetchUserWithSubscription(updatedUser);
     setUser(fullUser);
  }, [fetchUserWithSubscription]);

  if (databaseError) {
      return <DatabaseSetupError error={databaseError} />;
  }

  const renderContent = () => {
    if (isLoadingSession) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      );
    }

    switch (view) {
      case 'landing':
          return <LandingPage onStartTrial={() => setView('auth')} />;
      case 'auth':
          return <AuthPage onLogin={handleLogin} onBackToHome={() => setView('landing')} />;
      case 'app':
          if (user) {
              return <MainApp user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} onSetGlobalSuccess={setGlobalSuccess} />;
          }
          // Fallback if user is somehow null
          setView('landing');
          return null;
      default:
          return <LandingPage onStartTrial={() => setView('auth')} />;
    }
  }; 

  return (
    <>
      {globalError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-xl bg-red-800/90 backdrop-blur-sm border border-red-600 text-white p-4 rounded-lg shadow-lg text-center z-50 flex justify-between items-center animate-fade-in-up">
            <span>{globalError}</span>
            <button onClick={() => setGlobalError(null)} className="p-1 rounded-full hover:bg-red-700/50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
      )}
      {globalSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-xl bg-green-800/90 backdrop-blur-sm border border-green-600 text-white p-4 rounded-lg shadow-lg text-center z-50 flex justify-between items-center animate-fade-in-up">
            <span>{globalSuccess}</span>
            <button onClick={() => setGlobalSuccess(null)} className="p-1 rounded-full hover:bg-green-700/50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
      )}
      {renderContent()}
    </>
  );
};

export default App;
