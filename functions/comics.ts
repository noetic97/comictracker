// functions/comics.ts - Updated with Supabase RLS
import { Handler } from "@netlify/functions";
import { handleCors, createResponse, createErrorResponse } from "./utils/cors";
import { withSupabaseRLS } from "./utils/supabase";

// Enhanced validators for comic input (keep your existing validation logic)
type ExtendedComicInput = {
  // Core fields (required)
  publisher: string;
  series: string;
  issue: string;

  // Core optional fields
  issueNumber?: string | number;
  currentValue?: string | number;
  volume?: string;
  years?: string;
  type?: string;

  // Extended fields
  pricePaid?: string | number;
  grade?: string;
  gradeDetails?: string;
  storageLocation?: string;
  notes?: string;
  cert?: string;
  signed?: boolean | string;
  variantDetails?: string;
  dateAdded?: string | Date;
  issueDate?: string;
  datePurchased?: string | Date;
  storyTitle?: string;
  description?: string;
  writer?: string;
  artist?: string;
  coverArtist?: string;
  letterer?: string;
  firstAppearance?: string;
  coverImageUrl?: string;
  certificationCompany?: string;
  collected?: boolean;
  isGrail?: boolean;
};

const isNonEmptyString = (v: any): boolean =>
  typeof v === "string" && v.trim().length > 0;

const parseNumericField = (value: any): number | null => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;

  const parsed = parseFloat(String(value).replace(/[\$,\s]/g, ""));
  return isNaN(parsed) ? null : parsed;
};

const parseBooleanField = (value: any): boolean => {
  if (typeof value === "boolean") return value;
  if (!value) return false;

  const str = String(value).trim().toLowerCase();
  return ["true", "yes", "y", "1", "on", "signed", "checked"].includes(str);
};

const parseDateField = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;

  const parsed = new Date(String(value));
  return isNaN(parsed.getTime()) ? null : parsed;
};

const validateExtendedComic = (data: any): string[] => {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return ["Body must be a JSON object"];
  }

  // Required fields validation
  if (!isNonEmptyString(data.publisher))
    errors.push("'publisher' is required and must be a non-empty string");
  if (!isNonEmptyString(data.series))
    errors.push("'series' is required and must be a non-empty string");
  if (!isNonEmptyString(data.issue))
    errors.push("'issue' is required and must be a non-empty string");

  return errors;
};

// Transform frontend camelCase to database format
const transformComicForDatabase = (
  comic: ExtendedComicInput,
  userId: string
): any => {
  return {
    // Core fields
    publisher: comic.publisher.trim(),
    series: comic.series.trim(),
    volume: (comic.volume || "").trim(),
    years: (comic.years || "").trim(),
    type: (comic.type || "").trim(),
    issue: comic.issue.trim(),
    issueNumber: parseNumericField(comic.issueNumber || comic.issue) || 1,

    // Financial fields
    currentValue: parseNumericField(comic.currentValue) || 0,
    pricePaid: parseNumericField(comic.pricePaid),

    // Physical/ownership fields
    grade: comic.grade?.trim() || null,
    gradeDetails: comic.gradeDetails?.trim() || null,
    storageLocation: comic.storageLocation?.trim() || null,
    notes: comic.notes?.trim() || null,
    cert: comic.cert?.trim() || null,
    signed: parseBooleanField(comic.signed),
    variantDetails: comic.variantDetails?.trim() || null,

    // Date fields
    dateAdded: parseDateField(comic.dateAdded),
    issueDate: comic.issueDate?.trim() || null,
    datePurchased: parseDateField(comic.datePurchased),

    // Creative team fields
    storyTitle: comic.storyTitle?.trim() || null,
    description: comic.description?.trim() || null,
    writer: comic.writer?.trim() || null,
    artist: comic.artist?.trim() || null,
    coverArtist: comic.coverArtist?.trim() || null,
    letterer: comic.letterer?.trim() || null,
    firstAppearance: comic.firstAppearance?.trim() || null,
    coverImageUrl: comic.coverImageUrl?.trim() || null,
    certificationCompany: comic.certificationCompany?.trim() || null,

    // User state - auto-determine collected based on pricePaid
    collected:
      comic.collected ??
      (parseNumericField(comic.pricePaid) !== null &&
        parseNumericField(comic.pricePaid)! >= 0),
    isGrail: Boolean(comic.isGrail),

    // User context
    user_id: userId,
  };
};

// Transform database response to frontend format
const transformComicFromDatabase = (comic: any): any => {
  return {
    ...comic,
    userId: comic.user_id,
    // Add any other field transformations as needed
  };
};

export const handler: Handler = async (event) => {
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const { httpMethod, path } = event;
    const segments = path?.split("/").filter(Boolean) || [];

    // Parse URL segments for comic ID and actions
    let comicId: string | undefined;
    let action: string | undefined;

    if (segments.length >= 4 && segments[segments.length - 4] === "comics") {
      comicId = segments[segments.length - 3];
      action = segments[segments.length - 1];
    } else if (segments.length >= 3) {
      comicId = segments[segments.length - 2];
      action = segments[segments.length - 1];
    }

    return await withSupabaseRLS(event, async (supabase, userContext) => {
      switch (httpMethod) {
        case "GET":
          const {
            publisher,
            series,
            collected,
            isGrail,
            signed,
            grade,
            storageLocation,
            search,
            exact,
            page = "1",
            limit = "25",
          } = event.queryStringParameters || {};

          const pageNum = parseInt(page, 10);
          const limitNum = parseInt(limit, 10);
          const offset = (pageNum - 1) * limitNum;

          console.log(
            `📋 Getting comics for user ${userContext.userId}, page ${pageNum}, limit ${limitNum}`
          );

          let query = supabase
            .from("comics")
            .select("*", { count: "exact" })
            .eq("user_id", userContext.userId)
            .order("series", { ascending: true })
            .order("issueNumber", { ascending: true });

          // Apply filters
          if (publisher) {
            if (exact === "true") {
              query = query.eq("publisher", publisher);
            } else {
              query = query.ilike("publisher", `%${publisher}%`);
            }
          }
          if (series) {
            if (exact === "true") {
              query = query.eq("series", series);
            } else {
              query = query.ilike("series", `%${series}%`);
            }
          }
          if (collected === "true") query = query.eq("collected", true);
          if (collected === "false") query = query.eq("collected", false);
          if (isGrail === "true") query = query.eq("isGrail", true);
          if (signed === "true") query = query.eq("signed", true);
          if (grade) query = query.eq("grade", grade);
          if (storageLocation)
            query = query.ilike("storageLocation", `%${storageLocation}%`);

          if (search) {
            query = query.or(
              `publisher.ilike.%${search}%,series.ilike.%${search}%,issue.ilike.%${search}%`
            );
          }

          // Apply pagination
          query = query.range(offset, offset + limitNum - 1);

          console.log({ query });

          const { data: comics, error, count } = await query;

          console.log(comics?.length);

          if (error) {
            console.error("Supabase query error:", error);
            return createErrorResponse(500, `Database error: ${error.message}`);
          }

          // Transform comics for frontend
          const transformedComics = (comics || []).map(
            transformComicFromDatabase
          );

          console.log(
            `✅ Found ${transformedComics.length} comics (${count} total)`
          );

          return createResponse(200, {
            comics,
            pagination: {
              page: pageNum,
              limit: limitNum,
              total: count || 0,
              pages: Math.ceil((count || 0) / limitNum),
            },
          });

        case "POST":
          let body: any = {};
          try {
            body = event.body ? JSON.parse(event.body) : {};
          } catch {
            return createErrorResponse(400, "Invalid JSON body");
          }

          // Handle bulk operations
          if (path?.includes("/bulk") || body.comics) {
            const { comics: comicsToCreate } = body;

            if (!Array.isArray(comicsToCreate)) {
              return createErrorResponse(
                400,
                "Expected 'comics' array for bulk operation"
              );
            }

            console.log(
              `🚀 Starting bulk import of ${comicsToCreate.length} comics for user ${userContext.userId}`
            );
            const startTime = Date.now();

            // Validate and transform comics
            const validComics: any[] = [];
            const validationErrors: string[] = [];

            for (let i = 0; i < comicsToCreate.length; i++) {
              const comic = comicsToCreate[i];
              const errors = validateExtendedComic(comic);

              if (errors.length) {
                validationErrors.push(`Index ${i}: ${errors.join(", ")}`);
                continue;
              }

              const transformedComic = transformComicForDatabase(
                comic,
                userContext.userId
              );
              validComics.push(transformedComic);
            }

            if (validationErrors.length && validComics.length === 0) {
              return createResponse(422, {
                error: "Validation failed",
                errors: validationErrors.slice(0, 50),
              });
            }

            // Bulk insert with Supabase
            const { data: insertedComics, error: insertError } = await supabase
              .from("comics")
              .insert(validComics)
              .select();

            if (insertError) {
              console.error("Bulk insert error:", insertError);
              return createErrorResponse(
                500,
                `Bulk insert failed: ${insertError.message}`
              );
            }

            const endTime = Date.now();
            const totalTime = endTime - startTime;
            const created = insertedComics?.length || 0;

            console.log(
              `🎉 Bulk import completed: ${created} comics created in ${totalTime}ms`
            );

            return createResponse(201, {
              processed: validComics.length,
              created,
              updated: 0,
              errors: validationErrors.length,
              message: `Bulk import: ${created} comics created`,
              processingTime: totalTime,
              rate: Math.round(created / (totalTime / 1000)),
              validationErrors: validationErrors.slice(0, 10),
            });
          }

          // Single comic creation
          const createErrors = validateExtendedComic(body);
          if (createErrors.length) {
            return createResponse(422, {
              error: "Validation failed",
              errors: createErrors,
            });
          }

          const transformedComic = transformComicForDatabase(
            body,
            userContext.userId
          );

          const { data: newComic, error: createError } = await supabase
            .from("comics")
            .insert([transformedComic])
            .select()
            .single();

          if (createError) {
            return createErrorResponse(
              500,
              `Failed to create comic: ${createError.message}`
            );
          }

          return createResponse(201, transformComicFromDatabase(newComic));

        case "PATCH":
          // Handle toggle operations
          if (!comicId) {
            return createErrorResponse(
              400,
              "Comic ID required for PATCH operations"
            );
          }

          console.log(
            `🔄 Toggling ${action} for comic ${comicId} (user ${userContext.userId})`
          );

          // Get the comic first
          const { data: comic, error: fetchError } = await supabase
            .from("comics")
            .select("*")
            .eq("id", comicId)
            .eq("user_id", userContext.userId)
            .single();

          if (fetchError || !comic) {
            return createErrorResponse(404, "Comic not found");
          }

          let updateData: any = {};

          if (action === "collect") {
            updateData.collected = !comic.collected;
          } else if (action === "grail") {
            updateData.isGrail = !comic.isGrail;
          } else {
            return createErrorResponse(
              400,
              "Invalid action. Use 'collect' or 'grail'"
            );
          }

          const { data: updatedComic, error: updateError } = await supabase
            .from("comics")
            .update(updateData)
            .eq("id", comicId)
            .eq("user_id", userContext.userId)
            .select()
            .single();

          if (updateError) {
            return createErrorResponse(
              500,
              `Failed to update comic: ${updateError.message}`
            );
          }

          return createResponse(200, transformComicFromDatabase(updatedComic));

        case "PUT":
          // Update comic
          if (!comicId) {
            return createErrorResponse(
              400,
              "Comic ID required for PUT operations"
            );
          }

          let updateBody: any = {};
          try {
            updateBody = event.body ? JSON.parse(event.body) : {};
          } catch {
            return createErrorResponse(400, "Invalid JSON body");
          }

          const { data: updatedComicPut, error: putError } = await supabase
            .from("comics")
            .update(updateBody)
            .eq("id", comicId)
            .eq("user_id", userContext.userId)
            .select()
            .single();

          if (putError) {
            return createErrorResponse(
              500,
              `Failed to update comic: ${putError.message}`
            );
          }

          return createResponse(
            200,
            transformComicFromDatabase(updatedComicPut)
          );

        case "DELETE":
          // Delete comic
          if (!comicId) {
            return createErrorResponse(
              400,
              "Comic ID required for DELETE operations"
            );
          }

          const { error: deleteError } = await supabase
            .from("comics")
            .delete()
            .eq("id", comicId)
            .eq("user_id", userContext.userId);

          if (deleteError) {
            return createErrorResponse(
              500,
              `Failed to delete comic: ${deleteError.message}`
            );
          }

          return createResponse(204, null);

        default:
          return createErrorResponse(405, "Method not allowed");
      }
    });
  } catch (error: any) {
    console.error("Comics function error:", error);
    return createErrorResponse(500, `Internal server error: ${error.message}`);
  }
};
