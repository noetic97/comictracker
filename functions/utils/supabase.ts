import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface UserContext {
  userId: string;
  isAdmin: boolean;
  email?: string;
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
 * These will help with TypeScript autocomplete
 */
export interface DatabaseComic {
  id: string;
  user_id: string;
  publisher: string;
  series: string;
  volume: string;
  years: string;
  type: string;
  issue: string;
  issue_number: number;
  current_value: number;
  price_paid: number | null;
  grade: string | null;
  grade_details: string | null;
  storage_location: string | null;
  notes: string | null;
  cert: string | null;
  signed: boolean;
  variant_details: string | null;
  date_added: string | null;
  issue_date: string | null;
  date_purchased: string | null;
  story_title: string | null;
  description: string | null;
  writer: string | null;
  artist: string | null;
  cover_artist: string | null;
  letterer: string | null;
  first_appearance: string | null;
  cover_image_url: string | null;
  certification_company: string | null;
  collected: boolean;
  is_grail: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseFavoriteSeries {
  id: string;
  user_id: string;
  publisher: string;
  series: string;
  volume: string;
  date_added: string;
  created_at: string;
  updated_at: string;
}

/**
 * Transform camelCase fields to snake_case for database
 */
export const transformToDatabase = (data: any): any => {
  const transformed: any = {};

  // Field mapping from frontend camelCase to database snake_case
  const fieldMapping: Record<string, string> = {
    issueNumber: "issue_number",
    currentValue: "current_value",
    pricePaid: "price_paid",
    gradeDetails: "grade_details",
    storageLocation: "storage_location",
    variantDetails: "variant_details",
    dateAdded: "date_added",
    issueDate: "issue_date",
    datePurchased: "date_purchased",
    storyTitle: "story_title",
    coverArtist: "cover_artist",
    firstAppearance: "first_appearance",
    coverImageUrl: "cover_image_url",
    certificationCompany: "certification_company",
    isGrail: "is_grail",
    userId: "user_id",
    createdAt: "created_at",
    updatedAt: "updated_at",
  };

  Object.entries(data).forEach(([key, value]) => {
    const dbKey = fieldMapping[key] || key;
    transformed[dbKey] = value;
  });

  return transformed;
};

/**
 * Transform snake_case fields from database to camelCase for frontend
 */
export const transformFromDatabase = (data: any): any => {
  const transformed: any = {};

  // Reverse mapping from database snake_case to frontend camelCase
  const fieldMapping: Record<string, string> = {
    issue_number: "issueNumber",
    current_value: "currentValue",
    price_paid: "pricePaid",
    grade_details: "gradeDetails",
    storage_location: "storageLocation",
    variant_details: "variantDetails",
    date_added: "dateAdded",
    issue_date: "issueDate",
    date_purchased: "datePurchased",
    story_title: "storyTitle",
    cover_artist: "coverArtist",
    first_appearance: "firstAppearance",
    cover_image_url: "coverImageUrl",
    certification_company: "certificationCompany",
    is_grail: "isGrail",
    user_id: "userId",
    created_at: "createdAt",
    updated_at: "updatedAt",
  };

  Object.entries(data).forEach(([key, value]) => {
    const frontendKey = fieldMapping[key] || key;
    transformed[frontendKey] = value;
  });

  return transformed;
};
