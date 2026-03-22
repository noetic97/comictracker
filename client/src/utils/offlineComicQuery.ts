import { Comic, FavoriteSeries } from "../types";
import {
  AggregationFilters,
  ComicStats,
  PublisherSummary,
  SeriesSummary,
} from "../hooks/aggregations/types";
import { parseIssueNumber } from "./validation/sharedValidation";
import { normalizeForSorting } from "./sortingUtils";

const normVol = (v?: string | null): string => v ?? "";

function matchesFavoriteSeries(
  c: Comic,
  favorites: FavoriteSeries[]
): boolean {
  const v = normVol(c.volume);
  return favorites.some(
    (f) =>
      f.publisher === c.publisher &&
      f.series === c.series &&
      normVol(f.volume) === v
  );
}

/** Mirrors server buildWhere for aggregations (no userId). */
export function filterComicsForAggregations(
  comics: Comic[],
  filters: AggregationFilters,
  favoriteSeries: FavoriteSeries[]
): Comic[] {
  let out = comics;

  if (filters.publisher?.trim()) {
    const q = filters.publisher.toLowerCase();
    out = out.filter((c) => c.publisher.toLowerCase().includes(q));
  }
  if (filters.series?.trim()) {
    const q = filters.series.toLowerCase();
    out = out.filter((c) => c.series.toLowerCase().includes(q));
  }
  if (filters.volume?.trim()) {
    const q = normVol(filters.volume).toLowerCase();
    out = out.filter((c) => normVol(c.volume).toLowerCase().includes(q));
  }
  if (filters.collected === true) {
    out = out.filter((c) => c.collected);
  }
  if (filters.collected === false) {
    out = out.filter((c) => !c.collected);
  }
  if (filters.isGrail === true) {
    out = out.filter((c) => c.isGrail);
  }
  if (filters.signed === true) {
    out = out.filter((c) => c.signed);
  }
  if (filters.grade?.trim()) {
    out = out.filter((c) => c.grade === filters.grade);
  }
  if (filters.type !== undefined && filters.type !== "") {
    out = out.filter((c) => (c.type ?? "") === filters.type);
  }
  if (filters.minValue !== undefined && filters.minValue !== "") {
    const n = Number(filters.minValue);
    if (!Number.isNaN(n)) {
      out = out.filter((c) => (c.currentValue ?? 0) >= n);
    }
  }
  if (filters.maxValue !== undefined && filters.maxValue !== "") {
    const n = Number(filters.maxValue);
    if (!Number.isNaN(n)) {
      out = out.filter((c) => (c.currentValue ?? 0) <= n);
    }
  }
  if (filters.storageLocation?.trim()) {
    const q = filters.storageLocation.toLowerCase();
    out = out.filter((c) =>
      (c.storageLocation ?? "").toLowerCase().includes(q)
    );
  }
  if (filters.search?.trim()) {
    const q = filters.search.toLowerCase();
    out = out.filter(
      (c) =>
        c.publisher.toLowerCase().includes(q) ||
        c.series.toLowerCase().includes(q) ||
        (c.issue && c.issue.toLowerCase().includes(q))
    );
  }

  if (filters.filterOption && filters.filterOption !== "all") {
    switch (filters.filterOption) {
      case "collected":
        out = out.filter((c) => c.collected);
        break;
      case "uncollected":
        out = out.filter((c) => !c.collected);
        break;
      case "grailComicsOnly":
        out = out.filter((c) => c.isGrail);
        break;
      case "signed":
        out = out.filter((c) => c.signed);
        break;
      case "favoriteSeriesOnly":
        if (favoriteSeries.length === 0) {
          out = [];
        } else {
          out = out.filter((c) => matchesFavoriteSeries(c, favoriteSeries));
        }
        break;
    }
  }

  return out;
}

/** Series list route: exact publisher + secondary filters (mirrors getSeriesSummaries). */
export function filterComicsForSeriesSummaries(
  comics: Comic[],
  publisher: string,
  filters: AggregationFilters,
  favoriteSeries: FavoriteSeries[]
): Comic[] {
  let out = comics.filter((c) => c.publisher === publisher);

  if (filters.series?.trim()) {
    const q = filters.series.toLowerCase();
    out = out.filter((c) => c.series.toLowerCase().includes(q));
  }
  if (filters.volume?.trim()) {
    const q = normVol(filters.volume).toLowerCase();
    out = out.filter((c) => normVol(c.volume).toLowerCase().includes(q));
  }
  if (filters.collected === true) out = out.filter((c) => c.collected);
  if (filters.collected === false) out = out.filter((c) => !c.collected);
  if (filters.isGrail === true) out = out.filter((c) => c.isGrail);
  if (filters.signed === true) out = out.filter((c) => c.signed);
  if (filters.grade?.trim()) {
    out = out.filter((c) => c.grade === filters.grade);
  }
  if (filters.type !== undefined && filters.type !== "") {
    out = out.filter((c) => (c.type ?? "") === filters.type);
  }
  if (filters.minValue !== undefined && filters.minValue !== "") {
    const n = Number(filters.minValue);
    if (!Number.isNaN(n)) {
      out = out.filter((c) => (c.currentValue ?? 0) >= n);
    }
  }
  if (filters.maxValue !== undefined && filters.maxValue !== "") {
    const n = Number(filters.maxValue);
    if (!Number.isNaN(n)) {
      out = out.filter((c) => (c.currentValue ?? 0) <= n);
    }
  }
  if (filters.storageLocation?.trim()) {
    const q = filters.storageLocation.toLowerCase();
    out = out.filter((c) =>
      (c.storageLocation ?? "").toLowerCase().includes(q)
    );
  }
  if (filters.search?.trim()) {
    const q = filters.search.toLowerCase();
    out = out.filter(
      (c) =>
        c.publisher.toLowerCase().includes(q) ||
        c.series.toLowerCase().includes(q) ||
        (c.issue && c.issue.toLowerCase().includes(q))
    );
  }

  if (filters.filterOption === "favoriteSeriesOnly") {
    const favsForPub = favoriteSeries.filter((f) => f.publisher === publisher);
    if (favsForPub.length === 0) {
      out = [];
    } else {
      out = out.filter((c) =>
        favsForPub.some(
          (f) =>
            f.series === c.series && normVol(f.volume) === normVol(c.volume)
        )
      );
    }
  }

  return out;
}

export function computeComicStats(comics: Comic[]): ComicStats {
  return {
    total: comics.length,
    collected: comics.filter((c) => c.collected).length,
    grails: comics.filter((c) => c.isGrail).length,
    totalValue: comics.reduce((s, c) => s + (c.currentValue ?? 0), 0),
    collectedValue: comics
      .filter((c) => c.collected)
      .reduce((s, c) => s + (c.currentValue ?? 0), 0),
  };
}

export function computePublisherSummaries(
  comics: Comic[],
  sortBy?: string
): PublisherSummary[] {
  const publisherMap = new Map<string, PublisherSummary>();
  const seriesMap = new Map<string, Set<string>>();

  for (const comic of comics) {
    const pub = comic.publisher;
    if (!publisherMap.has(pub)) {
      publisherMap.set(pub, {
        publisher: pub,
        seriesCount: 0,
        totalComics: 0,
        collectedComics: 0,
        grailComics: 0,
        totalValue: 0,
      });
    }
    const summary = publisherMap.get(pub)!;
    summary.totalComics++;
    if (comic.collected) summary.collectedComics++;
    if (comic.isGrail) summary.grailComics++;
    summary.totalValue += comic.currentValue ?? 0;

    const seriesKey = `${comic.series}|${normVol(comic.volume)}`;
    if (!seriesMap.has(pub)) seriesMap.set(pub, new Set());
    seriesMap.get(pub)!.add(seriesKey);
  }

  seriesMap.forEach((set, publisher) => {
    const summary = publisherMap.get(publisher);
    if (summary) summary.seriesCount = set.size;
  });

  const publishers = Array.from(publisherMap.values());
  return sortPublishersLikeServer(publishers, sortBy as any);
}

function sortPublishersLikeServer(
  publishers: PublisherSummary[],
  sortBy?: string
): PublisherSummary[] {
  return [...publishers].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "seriesCount":
        comparison = a.seriesCount - b.seriesCount;
        return -comparison;
      case "totalComics":
        comparison = a.totalComics - b.totalComics;
        return -comparison;
      case "collectedComics":
        comparison = a.collectedComics - b.collectedComics;
        return -comparison;
      case "grailComics":
        comparison = a.grailComics - b.grailComics;
        return -comparison;
      case "totalValue":
        comparison = a.totalValue - b.totalValue;
        return -comparison;
      case "publisher":
      default:
        comparison = normalizeForSorting(a.publisher).localeCompare(
          normalizeForSorting(b.publisher)
        );
        return comparison;
    }
  });
}

export function computeSeriesSummaries(
  comics: Comic[],
  sortBy?: string
): SeriesSummary[] {
  const seriesMap = new Map<string, SeriesSummary>();

  for (const comic of comics) {
    const seriesKey = `${comic.series}|${normVol(comic.volume)}`;
    if (!seriesMap.has(seriesKey)) {
      seriesMap.set(seriesKey, {
        publisher: comic.publisher,
        series: comic.series,
        volume: normVol(comic.volume),
        issueCount: 0,
        collectedCount: 0,
        grailCount: 0,
        totalValue: 0,
        collectedValue: 0,
      });
    }
    const summary = seriesMap.get(seriesKey)!;
    summary.issueCount++;
    if (comic.collected) {
      summary.collectedCount++;
      summary.collectedValue += comic.currentValue ?? 0;
    }
    if (comic.isGrail) summary.grailCount++;
    summary.totalValue += comic.currentValue ?? 0;
  }

  const list = Array.from(seriesMap.values());
  return sortSeriesLikeServer(list, sortBy as any);
}

function sortSeriesLikeServer(
  series: SeriesSummary[],
  sortBy?: string
): SeriesSummary[] {
  return [...series].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "issueCount":
        comparison = a.issueCount - b.issueCount;
        return -comparison;
      case "collectedCount":
        comparison = a.collectedCount - b.collectedCount;
        return -comparison;
      case "grailCount":
        comparison = a.grailCount - b.grailCount;
        return -comparison;
      case "totalValue":
        comparison = a.totalValue - b.totalValue;
        return -comparison;
      case "collectedValue":
        comparison = a.collectedValue - b.collectedValue;
        return -comparison;
      case "series":
      default: {
        const na = normalizeForSorting(a.series);
        const nb = normalizeForSorting(b.series);
        comparison = na.localeCompare(nb);
        if (comparison === 0) {
          comparison = a.volume.localeCompare(b.volume);
        }
        return comparison;
      }
    }
  });
}

function isNullish(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === "string" && v.trim() === "") return true;
  return false;
}

function compareWithNullsLast(a: unknown, b: unknown, asc: boolean): number {
  const aNull = isNullish(a);
  const bNull = isNullish(b);
  if (aNull && bNull) return 0;
  if (aNull) return 1;
  if (bNull) return -1;
  if (typeof a === "number" && typeof b === "number") {
    return asc ? a - b : b - a;
  }
  if (typeof a === "boolean" && typeof b === "boolean") {
    const na = a ? 1 : 0;
    const nb = b ? 1 : 0;
    return asc ? na - nb : nb - na;
  }
  const sa = String(a);
  const sb = String(b);
  const c = sa.localeCompare(sb);
  return asc ? c : -c;
}

type ComicSortRow = Comic & { issueNumber: number };

function compareComicField(
  a: ComicSortRow,
  b: ComicSortRow,
  col: string,
  asc: boolean
): number {
  switch (col) {
    case "issueNumber":
      return compareWithNullsLast(
        a.issueNumber ?? 0,
        b.issueNumber ?? 0,
        asc
      );
    case "issue":
      return compareWithNullsLast(a.issue, b.issue, asc);
    case "series":
      return compareWithNullsLast(
        normalizeForSorting(a.series),
        normalizeForSorting(b.series),
        asc
      );
    case "publisher":
      return compareWithNullsLast(
        normalizeForSorting(a.publisher),
        normalizeForSorting(b.publisher),
        asc
      );
    case "currentValue":
      return compareWithNullsLast(
        a.currentValue ?? 0,
        b.currentValue ?? 0,
        asc
      );
    case "pricePaid":
      return compareWithNullsLast(a.pricePaid ?? 0, b.pricePaid ?? 0, asc);
    case "grade":
      return compareWithNullsLast(a.grade ?? "", b.grade ?? "", asc);
    case "collected":
      return compareWithNullsLast(a.collected, b.collected, asc);
    case "isGrail":
      return compareWithNullsLast(!!a.isGrail, !!b.isGrail, asc);
    case "type": {
      const typeOrderKey = (t?: string | null) => {
        const v = (t ?? "").trim();
        return v === "Issue" || v === "" ? "\uFFFF" + v : v;
      };
      return compareWithNullsLast(typeOrderKey(a.type), typeOrderKey(b.type), asc);
    }
    case "id":
      return compareWithNullsLast(a.id, b.id, asc);
    default:
      return compareWithNullsLast(a.issueNumber ?? 0, b.issueNumber ?? 0, asc);
  }
}

/**
 * Series-scoped comic list: exact publisher/series/volume + filters, then sort + slice.
 */
export function querySeriesComicsOffline(
  allComics: Comic[],
  params: {
    publisher: string;
    series: string;
    volume: string | null;
    extraFilters: AggregationFilters;
    favoriteSeries: FavoriteSeries[];
    offset: number;
    limit: number;
    order: string;
  }
): Comic[] {
  let out = allComics.filter(
    (c) =>
      c.publisher === params.publisher && c.series === params.series
  );

  if (params.volume) {
    out = out.filter((c) => normVol(c.volume) === normVol(params.volume));
  }

  out = filterComicsForAggregations(
    out,
    {
      ...params.extraFilters,
      publisher: undefined,
      series: undefined,
      volume: undefined,
    },
    params.favoriteSeries
  );

  const withNum: ComicSortRow[] = out.map((c) => ({
    ...c,
    issueNumber: c.issueNumber ?? parseIssueNumber(c.issue),
  }));

  const sorted = sortSeriesScopedComics(withNum, params.order);
  return sorted.slice(params.offset, params.offset + params.limit);
}

function sortSeriesScopedComics(
  comics: ComicSortRow[],
  order: string
): ComicSortRow[] {
  const trimmed = order.trim();
  const isTypeSort = trimmed.toLowerCase().startsWith("type.");
  const out = [...comics];

  if (isTypeSort) {
    const typeOrderKey = (t?: string | null) => {
      const v = (t ?? "").trim();
      return v === "Issue" || v === "" ? "\uFFFF" + v : v;
    };
    out.sort((a, b) => {
      const ka = typeOrderKey(a.type);
      const kb = typeOrderKey(b.type);
      if (ka !== kb) return ka.localeCompare(kb);
      return (a.issueNumber ?? 0) - (b.issueNumber ?? 0);
    });
    return out;
  }

  const firstPart = trimmed.split(",")[0]?.trim() ?? "";
  const [colRaw, dirRaw] = firstPart.split(".");
  const col = colRaw || "issueNumber";
  const asc = (dirRaw ?? "asc").toLowerCase() !== "desc";

  out.sort((a, b) => {
    const cmp = compareComicField(a, b, col, asc);
    if (cmp !== 0) return cmp;
    return a.id.localeCompare(b.id);
  });
  return out;
}
