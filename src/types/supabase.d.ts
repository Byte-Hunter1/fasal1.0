// Type declarations for Supabase JS client
declare module '@supabase/supabase-js' {
  export interface SupabaseClientOptions {
    auth?: {
      storage?: Storage | undefined;
      persistSession?: boolean;
      autoRefreshToken?: boolean;
    };
  }

  export interface SupabaseClient<T = any> {
    from: (table: string) => any;
    auth: {
      signIn: (credentials: any) => Promise<any>;
      signOut: () => Promise<any>;
      session: () => any;
    };
    storage: {
      from: (bucket: string) => any;
    };
    functions: {
      invoke: (functionName: string, options?: { body?: any }) => Promise<{ data: any; error: any }>;
    };
  }

  export function createClient<T = any>(
    supabaseUrl: string,
    supabaseKey: string,
    options?: SupabaseClientOptions
  ): SupabaseClient<T>;
}