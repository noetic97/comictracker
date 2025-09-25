import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface UserContext {
  userId: string;
  isAdmin: boolean;
  email: string;
}

/**
 * Get user context from the request
 * For now, returns default user (single-tenant mode)
 * Later: will parse JWT token from Authorization header
 */
export const getUserContext = async (event: any): Promise<UserContext> => {
  // Check for Authorization header (future multi-user support)
  const authHeader = event.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    // Future: Parse JWT token and get real user context
    // const token = authHeader.replace('Bearer ', '');
    // const { data, error } = await supabaseAuth.auth.getUser(token);
    // if (!error && data.user) {
    //   return {
    //     userId: data.user.id,
    //     isAdmin: false,
    //     email: data.user.email
    //   };
    // }
  }

  // Single-tenant mode: return default admin user
  return await ensureDefaultUser();
};

/**
 * Ensure default user exists and return context
 * This maintains backward compatibility for single-user setup
 */
const ensureDefaultUser = async (): Promise<UserContext> => {
  const defaultEmail =
    process.env.DEFAULT_USER_EMAIL || "user@comictracker.local";

  // Use service role to manage users
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    // Try to find existing default user
    const { data: existingUser, error: findError } = await supabaseAdmin
      .from("users")
      .select("id, email")
      .eq("email", defaultEmail)
      .single();

    if (existingUser && !findError) {
      return {
        userId: existingUser.id,
        isAdmin: true,
        email: existingUser.email,
      };
    }

    // Create default user if not found
    console.log("Creating default user:", defaultEmail);
    const { data: newUser, error: createError } = await supabaseAdmin
      .from("users")
      .insert([
        {
          email: defaultEmail,
          display_name: "Default User",
          email_verified: true,
          is_active: true,
        },
      ])
      .select("id, email")
      .single();

    if (createError) {
      console.error("Failed to create default user:", createError);
      throw new Error(`Authentication setup failed: ${createError.message}`);
    }

    console.log("Created default user:", newUser);
    return {
      userId: newUser.id,
      isAdmin: true,
      email: newUser.email,
    };
  } catch (error: any) {
    console.error("Error in ensureDefaultUser:", error);
    throw new Error(`Failed to setup default user: ${error.message}`);
  }
};

/**
 * Create Supabase client based on user context
 */
export const createSupabaseClient = (
  userContext: UserContext
): SupabaseClient => {
  if (userContext.isAdmin) {
    // Use service role for admin operations (bypasses RLS)
    return createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        db: {
          schema: "public",
        },
        global: {
          headers: {
            "Range-Unit": "items",
            Prefer: "count=exact",
          },
        },
      }
    );
  } else {
    // Use anon key for regular user operations (respects RLS)
    // Note: In the future, we'd set the user's JWT token here
    return createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            // Future: Set user context for RLS
            Authorization: `Bearer user-jwt-token-here`,
          },
        },
      }
    );
  }
};

/**
 * Main wrapper function for Supabase operations with user context
 * This replaces the old withPrisma pattern
 */
export const withSupabaseRLS = async <T>(
  event: any,
  callback: (supabase: SupabaseClient, userContext: UserContext) => Promise<T>
): Promise<T> => {
  try {
    const userContext = await getUserContext(event);
    const supabase = createSupabaseClient(userContext);

    console.log(
      `🔐 User context: ${userContext.email} (admin: ${userContext.isAdmin})`
    );

    return await callback(supabase, userContext);
  } catch (err: any) {
    console.error("Supabase RLS operation failed:", err);
    throw err;
  }
};

/**
 * Type definitions for database operations
 * These match the ACTUAL database schema (camelCase for most fields)
 */
export interface DatabaseComic {
  id: string;
  user_id: string; // Only user_id is snake_case
  publisher: string;
  series: string;
  volume: string;
  years: string;
  type: string;
  issue: string;
  issueNumber: number; // camelCase in database
  currentValue: number; // camelCase in database
  pricePaid: number | null; // camelCase in database
  grade: string | null;
  gradeDetails: string | null; // camelCase in database
  storageLocation: string | null; // camelCase in database
  notes: string | null;
  cert: string | null;
  signed: boolean;
  variantDetails: string | null; // camelCase in database
  dateAdded: string | null; // camelCase in database
  issueDate: string | null; // camelCase in database
  datePurchased: string | null; // camelCase in database
  storyTitle: string | null; // camelCase in database
  description: string | null;
  writer: string | null;
  artist: string | null;
  coverArtist: string | null; // camelCase in database
  letterer: string | null;
  firstAppearance: string | null; // camelCase in database
  coverImageUrl: string | null; // camelCase in database
  certificationCompany: string | null; // camelCase in database
  collected: boolean;
  isGrail: boolean; // camelCase in database
  createdAt: string; // camelCase in database
  updatedAt: string; // camelCase in database
}

export interface DatabaseFavoriteSeries {
  id: string;
  user_id: string; // Only user_id is snake_case
  publisher: string;
  series: string;
  volume: string;
  dateAdded: string; // camelCase in database
  createdAt: string; // camelCase in database
  updatedAt: string; // camelCase in database
}

/**
 * REMOVED: Incorrect transformation functions
 * The database uses camelCase for most fields, so no transformation needed
 * Only user_id is snake_case, which we handle in transformComicOutput
 */

/**
 * SIMPLIFIED: No field transformations needed except user_id
 * The database uses camelCase, so we pass data through as-is
 */
export const transformFromDatabase = (data: any): any => {
  if (data.user_id) {
    return {
      ...data,
      userId: data.user_id,
    };
  }
  return data;
};

/**
 * SIMPLIFIED: No field transformations needed except userId -> user_id
 * The database uses camelCase, so we pass data through as-is
 */
export const transformToDatabase = (data: any): any => {
  if (data.userId) {
    const { userId, ...rest } = data;
    return {
      ...rest,
      user_id: userId,
    };
  }
  return data;
};
