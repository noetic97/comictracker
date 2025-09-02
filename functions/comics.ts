import { Handler } from "@netlify/functions";
import { withPrisma } from "./utils/prisma";
import { handleCors, createResponse, createErrorResponse } from "./utils/cors";
import { ComicGrade } from "@prisma/client";

// Enhanced validators for extended comic input
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

  // Extended financial fields
  pricePaid?: string | number;

  // Extended physical/ownership fields
  grade?: ComicGrade | string;
  gradeDetails?: string;
  storageLocation?: string;
  notes?: string;
  cert?: string;
  signed?: boolean | string;
  variantDetails?: string;

  // Extended date fields
  dateAdded?: string | Date;
  issueDate?: string;
  datePurchased?: string | Date;

  // Extended creative team fields
  storyTitle?: string;
  description?: string;
  writer?: string;
  artist?: string;
  coverArtist?: string;
  letterer?: string;
  firstAppearance?: string;
  coverImageUrl?: string;
  certificationCompany?: string;

  // User state
  collected?: boolean;
  isGrail?: boolean;
};

const isNonEmptyString = (v: any): boolean =>
  typeof v === "string" && v.trim().length > 0;

const isValidGrade = (grade: any): boolean => {
  if (!grade) return true;
  return Object.values(ComicGrade).includes(grade as ComicGrade);
};

const isValidDate = (date: any): boolean => {
  if (!date) return true;
  if (date instanceof Date) return !isNaN(date.getTime());
  if (typeof date === "string") {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }
  return false;
};

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

  // Optional string fields validation
  const optionalStringFields = [
    "volume",
    "years",
    "type",
    "gradeDetails",
    "storageLocation",
    "notes",
    "cert",
    "variantDetails",
    "issueDate",
    "storyTitle",
    "description",
    "writer",
    "artist",
    "coverArtist",
    "letterer",
    "firstAppearance",
    "coverImageUrl",
    "certificationCompany",
  ];

  optionalStringFields.forEach((field) => {
    if (data[field] !== undefined && typeof data[field] !== "string") {
      errors.push(`'${field}' must be a string if provided`);
    }
  });

  // Numeric fields validation
  if (
    data.issueNumber !== undefined &&
    !(
      typeof data.issueNumber === "string" ||
      typeof data.issueNumber === "number"
    )
  ) {
    errors.push("'issueNumber' must be a string or number if provided");
  }

  if (
    data.currentValue !== undefined &&
    !(
      typeof data.currentValue === "string" ||
      typeof data.currentValue === "number"
    )
  ) {
    errors.push("'currentValue' must be a string or number if provided");
  }

  if (
    data.pricePaid !== undefined &&
    !(typeof data.pricePaid === "string" || typeof data.pricePaid === "number")
  ) {
    errors.push("'pricePaid' must be a string or number if provided");
  }

  // Grade validation
  if (data.grade !== undefined && !isValidGrade(data.grade)) {
    errors.push(`'grade' must be a valid ComicGrade enum value if provided`);
  }

  // Boolean fields validation
  if (
    data.signed !== undefined &&
    !(typeof data.signed === "boolean" || typeof data.signed === "string")
  ) {
    errors.push("'signed' must be a boolean or string if provided");
  }

  if (data.collected !== undefined && typeof data.collected !== "boolean") {
    errors.push("'collected' must be a boolean if provided");
  }

  if (data.isGrail !== undefined && typeof data.isGrail !== "boolean") {
    errors.push("'isGrail' must be a boolean if provided");
  }

  // Date fields validation
  if (data.dateAdded !== undefined && !isValidDate(data.dateAdded)) {
    errors.push("'dateAdded' must be a valid date if provided");
  }

  if (data.datePurchased !== undefined && !isValidDate(data.datePurchased)) {
    errors.push("'datePurchased' must be a valid date if provided");
  }

  return errors;
};

const validateExtendedComicUpdate = (data: any): string[] => {
  if (!data || typeof data !== "object") return ["Body must be a JSON object"];

  const allowedFields = [
    // Core fields
    "publisher",
    "series",
    "issue",
    "issueNumber",
    "currentValue",
    "volume",
    "years",
    "type",
    // Extended fields
    "pricePaid",
    "grade",
    "gradeDetails",
    "storageLocation",
    "notes",
    "cert",
    "signed",
    "variantDetails",
    "dateAdded",
    "issueDate",
    "datePurchased",
    "storyTitle",
    "description",
    "writer",
    "artist",
    "coverArtist",
    "letterer",
    "firstAppearance",
    "coverImageUrl",
    "certificationCompany",
    "collected",
    "isGrail",
  ];

  const errors: string[] = [];

  // Check for unknown fields
  Object.keys(data).forEach((key) => {
    if (!allowedFields.includes(key)) {
      errors.push(`Unknown field: ${key}`);
    }
  });

  // Validate provided fields (same logic as validateExtendedComic but all optional)
  if (data.publisher !== undefined && !isNonEmptyString(data.publisher))
    errors.push("'publisher' must be a non-empty string");
  if (data.series !== undefined && !isNonEmptyString(data.series))
    errors.push("'series' must be a non-empty string");
  if (data.issue !== undefined && !isNonEmptyString(data.issue))
    errors.push("'issue' must be a non-empty string");

  const stringFields = [
    "volume",
    "years",
    "type",
    "gradeDetails",
    "storageLocation",
    "notes",
    "cert",
    "variantDetails",
    "issueDate",
    "storyTitle",
    "description",
    "writer",
    "artist",
    "coverArtist",
    "letterer",
    "firstAppearance",
    "coverImageUrl",
    "certificationCompany",
  ];

  stringFields.forEach((field) => {
    if (data[field] !== undefined && typeof data[field] !== "string") {
      errors.push(`'${field}' must be a string if provided`);
    }
  });

  if (data.grade !== undefined && !isValidGrade(data.grade)) {
    errors.push("'grade' must be a valid ComicGrade enum value if provided");
  }

  const numericFields = ["issueNumber", "currentValue", "pricePaid"];
  numericFields.forEach((field) => {
    if (
      data[field] !== undefined &&
      !(typeof data[field] === "string" || typeof data[field] === "number")
    ) {
      errors.push(`'${field}' must be a string or number if provided`);
    }
  });

  const booleanFields = ["collected", "isGrail"];
  booleanFields.forEach((field) => {
    if (data[field] !== undefined && typeof data[field] !== "boolean") {
      errors.push(`'${field}' must be a boolean if provided`);
    }
  });

  if (
    data.signed !== undefined &&
    !(typeof data.signed === "boolean" || typeof data.signed === "string")
  ) {
    errors.push("'signed' must be a boolean or string if provided");
  }

  const dateFields = ["dateAdded", "datePurchased"];
  dateFields.forEach((field) => {
    if (data[field] !== undefined && !isValidDate(data[field])) {
      errors.push(`'${field}' must be a valid date if provided`);
    }
  });

  return errors;
};

const transformComicForDatabase = (comic: ExtendedComicInput): any => {
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
    grade: (comic.grade as ComicGrade) || null,
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
  };
};

// Main handler function - THIS IS THE KEY EXPORT FOR NETLIFY
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

    return await withPrisma(async (prisma) => {
      switch (httpMethod) {
        case "GET":
          // Enhanced GET with new field filtering
          const {
            publisher,
            series,
            collected,
            isGrail,
            signed,
            grade,
            storageLocation,
            search,
            page = "1",
            limit = "25",
          } = event.queryStringParameters || {};

          const pageNum = parseInt(page, 10);
          const limitNum = parseInt(limit, 10);
          const skip = (pageNum - 1) * limitNum;

          const where: any = {};

          // Existing filters
          if (publisher)
            where.publisher = { contains: publisher, mode: "insensitive" };
          if (series) where.series = { contains: series, mode: "insensitive" };
          if (collected === "true") where.collected = true;
          if (collected === "false") where.collected = false;
          if (isGrail === "true") where.isGrail = true;

          // New filters
          if (signed === "true") where.signed = true;
          if (grade) where.grade = grade as ComicGrade;
          if (storageLocation)
            where.storageLocation = {
              contains: storageLocation,
              mode: "insensitive",
            };

          if (search) {
            where.OR = [
              { publisher: { contains: search, mode: "insensitive" } },
              { series: { contains: search, mode: "insensitive" } },
              { issue: { contains: search, mode: "insensitive" } },
              { storyTitle: { contains: search, mode: "insensitive" } },
              { writer: { contains: search, mode: "insensitive" } },
              { artist: { contains: search, mode: "insensitive" } },
            ];
          }

          const [comics, total] = await Promise.all([
            prisma.comic.findMany({
              where,
              skip,
              take: limitNum,
              orderBy: [{ series: "asc" }, { issueNumber: "asc" }],
            }),
            prisma.comic.count({ where }),
          ]);

          return createResponse(200, {
            comics,
            pagination: {
              page: pageNum,
              limit: limitNum,
              total,
              pages: Math.ceil(total / limitNum),
            },
          });

        case "POST":
          // Handle both single and enhanced bulk creation
          let body: any = {};
          try {
            body = event.body ? JSON.parse(event.body) : {};
          } catch {
            return createErrorResponse(400, "Invalid JSON body");
          }

          // Enhanced bulk operation
          if (path?.includes("/bulk") || body.comics) {
            console.log(
              `🚀 Starting enhanced bulk import of ${
                body.comics?.length || 0
              } comics`
            );
            const startTime = Date.now();

            const { comics: comicsToCreate } = body;

            if (!Array.isArray(comicsToCreate)) {
              return createErrorResponse(
                400,
                "Expected 'comics' array for bulk operation"
              );
            }

            if (comicsToCreate.length === 0) {
              return createResponse(200, {
                processed: 0,
                created: 0,
                updated: 0,
                errors: 0,
                message: "No comics to process (empty array)",
                processingTime: 0,
                rate: 0,
              });
            }

            const MEGA_BATCH_SIZE = 100;
            const MAX_PROCESSING_TIME = 25000;

            console.log(
              `📊 Processing ${comicsToCreate.length} comics with enhanced fields in batches of ${MEGA_BATCH_SIZE}`
            );

            // Enhanced validation with new fields
            const validComics: any[] = [];
            const validationErrors: string[] = [];

            for (let i = 0; i < comicsToCreate.length; i++) {
              const comic = comicsToCreate[i];
              const errs = validateExtendedComic(comic);

              if (errs.length) {
                validationErrors.push(`Index ${i}: ${errs.join(", ")}`);
                continue;
              }

              // Transform and normalize the comic data
              const transformedComic = transformComicForDatabase(comic);
              validComics.push(transformedComic);
            }

            if (validationErrors.length && validComics.length === 0) {
              return createResponse(422, {
                error: "Validation failed",
                errors: validationErrors.slice(0, 50),
              });
            }

            // Enhanced bulk processing with new fields
            let processedCount = 0;
            let createdCount = 0;
            let updatedCount = 0;
            let errorCount = 0;
            const detailedErrors: string[] = [];

            try {
              for (let i = 0; i < validComics.length; i += MEGA_BATCH_SIZE) {
                const currentTime = Date.now();
                const elapsed = currentTime - startTime;

                if (elapsed > MAX_PROCESSING_TIME) {
                  console.log(
                    `⚠️ Approaching timeout at ${elapsed}ms, stopping early`
                  );
                  break;
                }

                const batch = validComics.slice(i, i + MEGA_BATCH_SIZE);
                const batchNum = Math.floor(i / MEGA_BATCH_SIZE) + 1;
                const totalBatches = Math.ceil(
                  validComics.length / MEGA_BATCH_SIZE
                );

                console.log(
                  `🔄 Processing enhanced batch ${batchNum}/${totalBatches} (${batch.length} comics) - ${elapsed}ms elapsed`
                );

                try {
                  // Try bulk create with all new fields
                  const created = await prisma.comic.createMany({
                    data: batch,
                    skipDuplicates: true,
                  });

                  createdCount += created.count;
                  processedCount += batch.length;

                  console.log(
                    `✨ Enhanced batch ${batchNum} completed: +${
                      created.count
                    } created, ${
                      batch.length - created.count
                    } duplicates skipped`
                  );
                } catch (bulkError: any) {
                  console.log(
                    `⚡ Bulk create failed for batch ${batchNum}, falling back to individual processing: ${bulkError.message}`
                  );

                  // Enhanced individual processing with update logic
                  const individualResults = await Promise.allSettled(
                    batch.map(async (comic) => {
                      try {
                        // Check if exists first (including type in uniqueness check)
                        const existing = await prisma.comic.findFirst({
                          where: {
                            publisher: comic.publisher,
                            series: comic.series,
                            volume: comic.volume,
                            issue: comic.issue,
                            type: comic.type,
                          },
                          select: {
                            id: true,
                            collected: true,
                            isGrail: true,
                            // Include new fields we want to preserve
                            pricePaid: true,
                            grade: true,
                            notes: true,
                          },
                        });

                        if (existing) {
                          // Enhanced update logic - preserve user state but update market data
                          const updateData = {
                            // Always update market/metadata
                            currentValue: comic.currentValue,
                            years: comic.years,
                            type: comic.type,
                            issueNumber: comic.issueNumber,

                            // Update extended fields if provided
                            ...(comic.storyTitle && {
                              storyTitle: comic.storyTitle,
                            }),
                            ...(comic.description && {
                              description: comic.description,
                            }),
                            ...(comic.writer && { writer: comic.writer }),
                            ...(comic.artist && { artist: comic.artist }),
                            ...(comic.coverArtist && {
                              coverArtist: comic.coverArtist,
                            }),
                            ...(comic.letterer && { letterer: comic.letterer }),
                            ...(comic.firstAppearance && {
                              firstAppearance: comic.firstAppearance,
                            }),
                            ...(comic.coverImageUrl && {
                              coverImageUrl: comic.coverImageUrl,
                            }),
                            ...(comic.issueDate && {
                              issueDate: comic.issueDate,
                            }),

                            // Only update ownership fields if not already set
                            ...(comic.pricePaid !== null &&
                              !existing.pricePaid && {
                                pricePaid: comic.pricePaid,
                              }),
                            ...(comic.grade &&
                              !existing.grade && { grade: comic.grade }),
                            ...(comic.notes &&
                              !existing.notes && { notes: comic.notes }),
                          };

                          await prisma.comic.update({
                            where: { id: existing.id },
                            data: updateData,
                          });
                          return { action: "updated", comic };
                        } else {
                          // Create new with all enhanced fields
                          await prisma.comic.create({ data: comic });
                          return { action: "created", comic };
                        }
                      } catch (individualError: any) {
                        const errorMsg = `${comic.series} #${comic.issue}: ${individualError.message}`;
                        console.error(
                          `❌ Individual error in enhanced batch ${batchNum}:`,
                          errorMsg
                        );
                        return { action: "error", error: errorMsg, comic };
                      }
                    })
                  );

                  // Process individual results
                  individualResults.forEach((result) => {
                    if (result.status === "fulfilled") {
                      if (result.value.action === "created") {
                        createdCount++;
                      } else if (result.value.action === "updated") {
                        updatedCount++;
                      } else if (result.value.action === "error") {
                        errorCount++;
                        if (detailedErrors.length < 20) {
                          detailedErrors.push(
                            result.value.error || "Unknown error"
                          );
                        }
                      }
                      processedCount++;
                    } else {
                      errorCount++;
                      if (detailedErrors.length < 20) {
                        detailedErrors.push(
                          `Enhanced batch ${batchNum} promise error: ${result.reason}`
                        );
                      }
                    }
                  });
                }

                // Progress logging
                const currentElapsed = Date.now() - startTime;
                const avgTimePerBatch = currentElapsed / batchNum;
                const estimatedTotal = avgTimePerBatch * totalBatches;

                console.log(
                  `📈 Enhanced Progress: ${processedCount}/${
                    validComics.length
                  } (${((processedCount / validComics.length) * 100).toFixed(
                    1
                  )}%) | ETA: ${(
                    (estimatedTotal - currentElapsed) /
                    1000
                  ).toFixed(1)}s`
                );
              }
            } catch (globalError: any) {
              console.error(
                "💀 Global enhanced processing error:",
                globalError.message
              );
              return createErrorResponse(
                500,
                `Enhanced processing failed: ${globalError.message}`
              );
            }

            const endTime = Date.now();
            const totalTime = endTime - startTime;

            console.log(`🎉 Enhanced bulk import completed!`);
            console.log(
              `📊 Results: ${createdCount} created, ${updatedCount} updated, ${errorCount} errors`
            );
            console.log(
              `⏱️ Total time: ${totalTime}ms (${(totalTime / 1000).toFixed(
                1
              )}s)`
            );
            console.log(
              `🚄 Rate: ${(processedCount / (totalTime / 1000)).toFixed(
                1
              )} comics/second`
            );

            return createResponse(201, {
              processed: processedCount,
              created: createdCount,
              updated: updatedCount,
              errors: errorCount,
              message: `Enhanced bulk import: ${processedCount} processed (${createdCount} created, ${updatedCount} updated, ${errorCount} errors) in ${(
                totalTime / 1000
              ).toFixed(1)}s`,
              processingTime: totalTime,
              rate: Math.round(processedCount / (totalTime / 1000)),
              validationErrors: validationErrors.slice(0, 10),
              processingErrors: detailedErrors,
              incomplete: processedCount < validComics.length,
            });
          }

          // Enhanced single comic creation
          const createErrors = validateExtendedComic(body);
          if (createErrors.length) {
            return createResponse(422, {
              error: "Validation failed",
              errors: createErrors,
            });
          }

          const transformedComic = transformComicForDatabase(body);
          const newComic = await prisma.comic.create({
            data: transformedComic,
          });

          return createResponse(201, newComic);

        case "PATCH":
          // Handle toggle operations
          if (!comicId) {
            return createErrorResponse(
              400,
              "Comic ID required for PATCH operations"
            );
          }

          let comic = await prisma.comic.findUnique({
            where: { id: comicId },
          });

          if (!comic && comicId.includes("-")) {
            const parts = comicId.split("-");
            if (parts.length >= 4) {
              const [publisher, series, volume, issue] = parts;
              comic = await prisma.comic.findFirst({
                where: { publisher, series, volume, issue },
              });
            }
          }

          if (!comic) {
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

          const updatedComic = await prisma.comic.update({
            where: { id: comic.id },
            data: updateData,
          });

          return createResponse(200, updatedComic);

        case "PUT":
          // Enhanced comic update with new fields
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

          const updateErrors = validateExtendedComicUpdate(updateBody);
          if (updateErrors.length) {
            return createResponse(422, {
              error: "Validation failed",
              errors: updateErrors,
            });
          }

          // Transform update data
          const transformedUpdate = transformComicForDatabase(updateBody);

          const updatedComicPut = await prisma.comic.update({
            where: { id: comicId },
            data: transformedUpdate,
          });

          return createResponse(200, updatedComicPut);

        case "DELETE":
          // Delete comic
          if (!comicId) {
            return createErrorResponse(
              400,
              "Comic ID required for DELETE operations"
            );
          }

          await prisma.comic.delete({
            where: { id: comicId },
          });

          return createResponse(204, null);

        default:
          return createErrorResponse(405, "Method not allowed");
      }
    });
  } catch (error: any) {
    console.error("Enhanced comics function error:", error);
    return createErrorResponse(500, `Internal server error: ${error.message}`);
  }
};
