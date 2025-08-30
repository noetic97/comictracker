import { Handler } from "@netlify/functions";
import { withPrisma } from "./utils/prisma";
import { handleCors, createResponse, createErrorResponse } from "./utils/cors";

// --- Validators for comic input ---
type NewComicInput = {
  publisher: string;
  series: string;
  issue: string;
  issueNumber?: string | number;
  currentValue?: string | number;
  volume?: string;
  years?: string;
  type?: string;
};

const isNonEmptyString = (v: any) =>
  typeof v === "string" && v.trim().length > 0;

const validateNewComic = (data: any) => {
  const errors: string[] = [];
  if (!data || typeof data !== "object") {
    return ["Body must be a JSON object"];
  }
  if (!isNonEmptyString(data.publisher))
    errors.push("'publisher' is required and must be a non-empty string");
  if (!isNonEmptyString(data.series))
    errors.push("'series' is required and must be a non-empty string");
  if (!isNonEmptyString(data.issue))
    errors.push("'issue' is required and must be a non-empty string");
  if (data.volume !== undefined && typeof data.volume !== "string")
    errors.push("'volume' must be a string if provided");
  if (data.years !== undefined && typeof data.years !== "string")
    errors.push("'years' must be a string if provided");
  if (data.type !== undefined && typeof data.type !== "string")
    errors.push("'type' must be a string if provided");
  if (
    data.issueNumber !== undefined &&
    !(
      typeof data.issueNumber === "string" ||
      typeof data.issueNumber === "number"
    )
  )
    errors.push("'issueNumber' must be a string or number if provided");
  if (
    data.currentValue !== undefined &&
    !(
      typeof data.currentValue === "string" ||
      typeof data.currentValue === "number"
    )
  )
    errors.push("'currentValue' must be a string or number if provided");
  return errors;
};

const validateComicUpdate = (data: any) => {
  if (!data || typeof data !== "object") return ["Body must be a JSON object"];
  const allowed = [
    "publisher",
    "series",
    "issue",
    "issueNumber",
    "currentValue",
    "volume",
    "years",
    "type",
    "collected",
    "isGrail",
  ];
  const errors: string[] = [];
  Object.keys(data).forEach((k) => {
    if (!allowed.includes(k)) errors.push(`Unknown field: ${k}`);
  });
  if (data.publisher !== undefined && !isNonEmptyString(data.publisher))
    errors.push("'publisher' must be a non-empty string");
  if (data.series !== undefined && !isNonEmptyString(data.series))
    errors.push("'series' must be a non-empty string");
  if (data.issue !== undefined && !isNonEmptyString(data.issue))
    errors.push("'issue' must be a non-empty string");
  if (data.volume !== undefined && typeof data.volume !== "string")
    errors.push("'volume' must be a string");
  if (data.years !== undefined && typeof data.years !== "string")
    errors.push("'years' must be a string");
  if (data.type !== undefined && typeof data.type !== "string")
    errors.push("'type' must be a string");
  if (
    data.issueNumber !== undefined &&
    !(
      typeof data.issueNumber === "string" ||
      typeof data.issueNumber === "number"
    )
  )
    errors.push("'issueNumber' must be a string or number");
  if (
    data.currentValue !== undefined &&
    !(
      typeof data.currentValue === "string" ||
      typeof data.currentValue === "number"
    )
  )
    errors.push("'currentValue' must be a string or number");
  if (data.collected !== undefined && typeof data.collected !== "boolean")
    errors.push("'collected' must be a boolean");
  if (data.isGrail !== undefined && typeof data.isGrail !== "boolean")
    errors.push("'isGrail' must be a boolean");
  return errors;
};

export const handler: Handler = async (event) => {
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const { httpMethod, path } = event;
    const segments = path?.split("/").filter(Boolean) || [];

    // Parse URL segments correctly
    let comicId: string | undefined;
    let action: string | undefined;

    // Handle different URL patterns:
    // /comics/{id}/collect or /comics/{id}/grail
    if (segments.length >= 4 && segments[segments.length - 4] === "comics") {
      comicId = segments[segments.length - 3]; // The ID is before the action
      action = segments[segments.length - 1]; // The action is the last segment
    } else if (segments.length >= 3) {
      // Fallback for other patterns
      comicId = segments[segments.length - 2];
      action = segments[segments.length - 1];
    }

    return await withPrisma(async (prisma) => {
      switch (httpMethod) {
        case "GET":
          // Get comics with pagination and filtering
          const {
            publisher,
            series,
            collected,
            isGrail,
            search,
            page = "1",
            limit = "25",
          } = event.queryStringParameters || {};

          const pageNum = parseInt(page, 10);
          const limitNum = parseInt(limit, 10);
          const skip = (pageNum - 1) * limitNum;

          const where: any = {};

          if (publisher)
            where.publisher = { contains: publisher, mode: "insensitive" };
          if (series) where.series = { contains: series, mode: "insensitive" };
          if (collected === "true") where.collected = true;
          if (collected === "false") where.collected = false;
          if (isGrail === "true") where.isGrail = true;
          if (search) {
            where.OR = [
              { publisher: { contains: search, mode: "insensitive" } },
              { series: { contains: search, mode: "insensitive" } },
              { issue: { contains: search, mode: "insensitive" } },
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
          // Handle both single and bulk creation
          let body: any = {};
          try {
            body = event.body ? JSON.parse(event.body) : {};
          } catch {
            return createErrorResponse(400, "Invalid JSON body");
          }

          // Check if this is a bulk operation
          if (path?.includes("/bulk") || body.comics) {
            console.log(
              `🚀 Starting MEGA bulk import of ${
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

            // Handle empty arrays gracefully
            if (comicsToCreate.length === 0) {
              console.log("⚠️ Received empty comics array, returning success");
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

            // For large datasets, we need to be MUCH more aggressive
            const MEGA_BATCH_SIZE = 100; // Process 100 comics at a time
            const MAX_PROCESSING_TIME = 25000; // 25 seconds max (5 second buffer)

            console.log(
              `📊 Processing ${comicsToCreate.length} comics in batches of ${MEGA_BATCH_SIZE}`
            );
            console.log(`⏱️  Max processing time: ${MAX_PROCESSING_TIME}ms`);

            // Quick validation pass using lightweight runtime checks
            const validComics: any[] = [];
            const validationErrors: string[] = [];

            for (let i = 0; i < comicsToCreate.length; i++) {
              const comic = comicsToCreate[i];
              const errs = validateNewComic(comic);
              if (errs.length) {
                validationErrors.push(`Index ${i}: ${errs.join(", ")}`);
                continue;
              }

              validComics.push({
                publisher: comic.publisher.trim(),
                series: comic.series.trim(),
                volume: (comic.volume || "").trim(),
                years: (comic.years || "").trim(),
                type: (comic.type || "").trim(),
                issue: comic.issue.trim(),
                issueNumber:
                  parseInt(comic.issueNumber) || parseInt(comic.issue) || 1,
                currentValue: parseFloat(comic.currentValue) || 0,
                collected: false,
                isGrail: false,
              });
            }

            if (validationErrors.length && validComics.length === 0) {
              return createResponse(422, {
                error: "Validation failed",
                errors: validationErrors.slice(0, 50),
              });
            }

            // High-performance bulk processing
            let processedCount = 0;
            let createdCount = 0;
            let updatedCount = 0;
            let errorCount = 0;
            const detailedErrors: string[] = [];

            try {
              // Process in mega batches
              for (let i = 0; i < validComics.length; i += MEGA_BATCH_SIZE) {
                const currentTime = Date.now();
                const elapsed = currentTime - startTime;

                // Check if we're approaching timeout
                if (elapsed > MAX_PROCESSING_TIME) {
                  console.log(
                    `⚠️  Approaching timeout at ${elapsed}ms, stopping early`
                  );
                  break;
                }

                const batch = validComics.slice(i, i + MEGA_BATCH_SIZE);
                const batchNum = Math.floor(i / MEGA_BATCH_SIZE) + 1;
                const totalBatches = Math.ceil(
                  validComics.length / MEGA_BATCH_SIZE
                );

                console.log(
                  `🔄 Processing mega-batch ${batchNum}/${totalBatches} (${batch.length} comics) - ${elapsed}ms elapsed`
                );

                try {
                  // Use createMany for bulk inserts - much faster than individual creates
                  const createData = batch.map((comic) => ({
                    ...comic,
                    // Add a temporary unique suffix to handle potential duplicates
                    tempId:
                      `${comic.publisher}_${comic.series}_${comic.volume}_${comic.issue}`.replace(
                        /[^a-zA-Z0-9_]/g,
                        "_"
                      ),
                  }));

                  // Try bulk create first (fastest method)
                  try {
                    const created = await prisma.comic.createMany({
                      data: createData.map(({ tempId, ...comic }) => comic),
                      skipDuplicates: true, // Skip duplicates instead of erroring
                    });

                    createdCount += created.count;
                    processedCount += batch.length;

                    console.log(
                      `✨ Mega-batch ${batchNum} completed: +${
                        created.count
                      } created, ${
                        batch.length - created.count
                      } duplicates skipped`
                    );
                  } catch (bulkError: any) {
                    console.log(
                      `⚡ Bulk create failed for batch ${batchNum}, falling back to individual processing: ${bulkError.message}`
                    );

                    // Fallback: process individually with better error handling
                    const individualResults = await Promise.allSettled(
                      batch.map(async (comic) => {
                        try {
                          // Check if exists first
                          const existing = await prisma.comic.findFirst({
                            where: {
                              publisher: comic.publisher,
                              series: comic.series,
                              volume: comic.volume,
                              issue: comic.issue,
                            },
                            select: {
                              id: true,
                              collected: true,
                              isGrail: true,
                            },
                          });

                          if (existing) {
                            // Update with new data but preserve user state
                            await prisma.comic.update({
                              where: { id: existing.id },
                              data: {
                                currentValue: comic.currentValue,
                                years: comic.years,
                                type: comic.type,
                                issueNumber: comic.issueNumber,
                              },
                            });
                            return { action: "updated", comic };
                          } else {
                            // Create new
                            await prisma.comic.create({ data: comic });
                            return { action: "created", comic };
                          }
                        } catch (individualError: any) {
                          const errorMsg = `${comic.series} #${comic.issue}: ${individualError.message}`;
                          console.error(
                            `❌ Individual error in batch ${batchNum}:`,
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
                            // Limit error details
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
                            `Batch ${batchNum} promise error: ${result.reason}`
                          );
                        }
                      }
                    });

                    console.log(
                      `🔧 Individual processing for batch ${batchNum} complete`
                    );
                  }
                } catch (batchError: any) {
                  console.error(
                    `💥 Critical error in mega-batch ${batchNum}:`,
                    batchError.message
                  );
                  errorCount += batch.length;
                  if (detailedErrors.length < 20) {
                    detailedErrors.push(
                      `Batch ${batchNum} failed: ${batchError.message}`
                    );
                  }
                }

                // Progress update
                const currentElapsed = Date.now() - startTime;
                const avgTimePerBatch = currentElapsed / batchNum;
                const estimatedTotal = avgTimePerBatch * totalBatches;

                console.log(
                  `📈 Progress: ${processedCount}/${validComics.length} (${(
                    (processedCount / validComics.length) *
                    100
                  ).toFixed(1)}%) | ETA: ${(
                    (estimatedTotal - currentElapsed) /
                    1000
                  ).toFixed(1)}s`
                );
              }
            } catch (globalError: any) {
              console.error("💀 Global processing error:", globalError.message);
              return createErrorResponse(
                500,
                `Processing failed: ${globalError.message}`
              );
            }

            const endTime = Date.now();
            const totalTime = endTime - startTime;

            console.log(`🎉 MEGA bulk import completed!`);
            console.log(
              `📊 Results: ${createdCount} created, ${updatedCount} updated, ${errorCount} errors`
            );
            console.log(
              `⏱️  Total time: ${totalTime}ms (${(totalTime / 1000).toFixed(
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
              message: `Mega bulk import: ${processedCount} processed (${createdCount} created, ${updatedCount} updated, ${errorCount} errors) in ${(
                totalTime / 1000
              ).toFixed(1)}s`,
              processingTime: totalTime,
              rate: Math.round(processedCount / (totalTime / 1000)),
              validationErrors: validationErrors.slice(0, 10),
              processingErrors: detailedErrors,
              incomplete: processedCount < validComics.length,
            });
          }

          // Single comic creation (unchanged)
          const {
            publisher: newPublisher,
            series: newSeries,
            issue,
            issueNumber,
            currentValue,
            volume,
            years,
            type,
          } = body;

          const createErrors = validateNewComic({
            publisher: newPublisher,
            series: newSeries,
            issue,
            issueNumber,
            currentValue,
            volume,
            years,
            type,
          });
          if (createErrors.length) {
            return createResponse(422, {
              error: "Validation failed",
              errors: createErrors,
            });
          }

          const newComic = await prisma.comic.create({
            data: {
              publisher: newPublisher,
              series: newSeries,
              volume: volume || "",
              years: years || "",
              type: type || "",
              issue,
              issueNumber: parseInt(issueNumber) || parseInt(issue) || 1,
              currentValue: parseFloat(currentValue) || 0,
              collected: false,
              isGrail: false,
            },
          });

          return createResponse(201, newComic);

        case "PATCH":
          // Handle toggle operations (unchanged)
          if (!comicId) {
            return createErrorResponse(
              400,
              "Comic ID required for PATCH operations"
            );
          }
          // Try to find by ID first, then by composite key if that fails
          let comic = await prisma.comic.findUnique({
            where: { id: comicId },
          });

          // If not found by ID, try to parse the client-generated ID format
          if (!comic && comicId.includes("-")) {
            const parts = comicId.split("-");
            if (parts.length >= 4) {
              const [publisher, series, volume, issue] = parts;
              comic = await prisma.comic.findFirst({
                where: {
                  publisher: publisher,
                  series: series,
                  volume: volume,
                  issue: issue,
                },
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
            where: { id: comicId },
            data: updateData,
          });

          return createResponse(200, updatedComic);

        case "PUT":
          // Update comic (unchanged)
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
          const updateErrors = validateComicUpdate(updateBody);
          if (updateErrors.length) {
            return createResponse(422, {
              error: "Validation failed",
              errors: updateErrors,
            });
          }
          const updatedComicPut = await prisma.comic.update({
            where: { id: comicId },
            data: updateBody,
          });

          return createResponse(200, updatedComicPut);

        case "DELETE":
          // Delete comic (unchanged)
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
    console.error("Comics function error:", error);
    return createErrorResponse(500, `Internal server error: ${error.message}`);
  }
};
