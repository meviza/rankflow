import { SEOScores, FixSuggestion, ScanResult } from "@/lib/types";

interface ParsedMeta {
  title: string | null;
  titleLength: number;
  description: string | null;
  descriptionLength: number;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  robots: string | null;
  viewport: string | null;
  hreflang: string[];
  schemaTypes: string[];
  canonical: string | null;
}

interface ParsedContent {
  headings: { h1: number; h2: number; h3: number; h4: number; h5: number; h6: number };
  images: { total: number; withAlt: number };
  links: { internal: number; external: number };
  wordCount: number;
}

const BROWSER_USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
];

const BROWSER_HEADERS = {
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "en-US,en;q=0.9,tr;q=0.8,de;q=0.7,fr;q=0.6",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  "Sec-Ch-Ua": '"Chromium";v="131", "Not_A Brand";v="99"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

async function fetchWithRetry(url: string, maxRetries = 3, timeoutMs = 20000): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          ...BROWSER_HEADERS,
          "User-Agent": BROWSER_USER_AGENTS[attempt % BROWSER_USER_AGENTS.length],
        },
        redirect: "follow",
      });
      if (response.ok || (response.status >= 300 && response.status < 400)) {
        return response;
      }
      if (response.status === 403 || response.status === 429) {
        lastError = new Error(`HTTP ${response.status} ${response.statusText}`);
        continue;
      }
      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError ?? new Error("Failed to fetch after retries");
}

function parseMetaTags(html: string): ParsedMeta {
  const getMetaName = (name: string): string | null => {
    const regex = new RegExp(
      `<meta\\s+[^>]*name\\s*=\\s*["']${name}["'][^>]*content\\s*=\\s*["']([^"']*)["'][^>]*/?>`,
      "i"
    );
    const m1 = html.match(regex);
    if (m1) return m1[1].trim();
    const regexAlt = new RegExp(
      `<meta\\s+[^>]*content\\s*=\\s*["']([^"']*)["'][^>]*name\\s*=\\s*["']${name}["'][^>]*/?>`,
      "i"
    );
    const m2 = html.match(regexAlt);
    return m2?.[1]?.trim() ?? null;
  };

  const getMetaProperty = (property: string): string | null => {
    const regex = new RegExp(
      `<meta\\s+[^>]*property\\s*=\\s*["']${property}["'][^>]*content\\s*=\\s*["']([^"']*)["'][^>]*/?>`,
      "i"
    );
    const m1 = html.match(regex);
    if (m1) return m1[1].trim();
    const regexAlt = new RegExp(
      `<meta\\s+[^>]*content\\s*=\\s*["']([^"']*)["'][^>]*property\\s*=\\s*["']${property}["'][^>]*/?>`,
      "i"
    );
    const m2 = html.match(regexAlt);
    return m2?.[1]?.trim() ?? null;
  };

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch?.[1]?.trim() ?? null;

  const canonical =
    html.match(/<link\s+[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']*)["'][^>]*\/?>/i)?.[1]?.trim() ??
    html.match(/<link\s+[^>]*href\s*=\s*["']([^"']*)["'][^>]*rel\s*=\s*["']canonical["'][^>]*\/?>/i)?.[1]?.trim() ??
    null;

  const hreflangMatches = html.match(
    /<link\s+[^>]*rel\s*=\s*["']alternate["'][^>]*hreflang\s*=\s*["']([^"']*)["'][^>]*\/?>/gi
  );
  const hreflang = hreflangMatches
    ? hreflangMatches
        .map((m) => m.match(/hreflang\s*=\s*["']([^"']*)["']/i)?.[1] ?? "")
        .filter(Boolean)
    : [];

  const schemaMatches = html.match(
    /<script\s+[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );
  const schemaTypes: string[] = [];
  if (schemaMatches) {
    for (const match of schemaMatches) {
      const innerMatch = match.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
      const json = innerMatch?.[1] ?? "";
      const typeMatches = json.match(/"@type"\s*:\s*"([^"]+)"/gi);
      if (typeMatches) {
        for (const tm of typeMatches) {
          const t = tm.match(/"@type"\s*:\s*"([^"]+)"/i)?.[1];
          if (t && !schemaTypes.includes(t)) schemaTypes.push(t);
        }
      }
    }
  }

  return {
    title,
    titleLength: title?.length ?? 0,
    description: getMetaName("description"),
    descriptionLength: (getMetaName("description") ?? "").length,
    ogTitle: getMetaProperty("og:title"),
    ogDescription: getMetaProperty("og:description"),
    ogImage: getMetaProperty("og:image"),
    twitterCard: getMetaName("twitter:card"),
    twitterTitle: getMetaName("twitter:title"),
    twitterDescription: getMetaName("twitter:description"),
    robots: getMetaName("robots"),
    viewport: getMetaName("viewport"),
    hreflang,
    schemaTypes,
    canonical,
  };
}

function parseContent(html: string): ParsedContent {
  const bodyMatch = html.match(/<body[\s\S]*?>([\s\S]*?)<\/body>/i);
  const bodyHtml = bodyMatch?.[1] ?? html;

  const stripTags = (s: string) => s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const text = stripTags(bodyHtml);
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;

  const countTag = (tag: string): number =>
    (bodyHtml.match(new RegExp(`<${tag}[^>]*>`, "gi")) ?? []).length;

  const h1 = countTag("h1");
  const h2 = countTag("h2");
  const h3 = countTag("h3");
  const h4 = countTag("h4");
  const h5 = countTag("h5");
  const h6 = countTag("h6");

  const imgTags = html.match(/<img\s+[^>]*\/?>/gi) ?? [];
  const total = imgTags.length;
  const withAlt = imgTags.filter((tag) => /alt\s*=\s*["'][^"']*["']/i.test(tag)).length;

  const linkTags = html.match(/<a\s+[^>]*href\s*=\s*["']([^"']*)["'][^>]*>/gi) ?? [];
  let internal = 0;
  let external = 0;
  for (const tag of linkTags) {
    const h = tag.match(/href\s*=\s*["']([^"']*)["']/i)?.[1]?.trim() ?? "";
    if (/^https?:\/\//i.test(h)) {
      external++;
    } else if (!h.startsWith("#") && !h.startsWith("javascript:") && !h.startsWith("mailto:") && !h.startsWith("tel:")) {
      internal++;
    }
  }

  return {
    headings: { h1, h2, h3, h4, h5, h6 },
    images: { total, withAlt },
    links: { internal, external },
    wordCount,
  };
}

function calculateScores(
  url: string,
  meta: ParsedMeta,
  content: ParsedContent,
  robotsTxtExists: boolean,
  sitemapExists: boolean,
  pageSizeBytes: number
): { scores: SEOScores; fixes: FixSuggestion[] } {
  const fixes: FixSuggestion[] = [];
  let fixId = 0;
  const addFix = (
    type: FixSuggestion["type"],
    severity: FixSuggestion["severity"],
    description: string,
    code: string | null = null
  ) => {
    fixes.push({ id: `fix-${++fixId}`, type, severity, description, code, applied: false });
  };

  const isHttps = url.startsWith("https://");
  let technicalScore = 100;

  if (!isHttps) {
    technicalScore -= 25;
    addFix("technical", "critical", "Site is not using HTTPS — migrate to HTTPS immediately.");
  }
  if (!robotsTxtExists) {
    technicalScore -= 15;
    addFix("technical", "high", "robots.txt not found — create one to control search engine crawling.", "User-agent: *\nDisallow:");
  }
  if (!sitemapExists) {
    technicalScore -= 15;
    addFix("technical", "high", "XML sitemap not found — generate and submit one to search consoles.");
  }
  if (!meta.viewport) {
    technicalScore -= 15;
    addFix(
      "technical",
      "high",
      "Viewport meta tag missing — add for mobile responsiveness.",
      '<meta name="viewport" content="width=device-width, initial-scale=1">'
    );
  }
  if (pageSizeBytes > 5_000_000) {
    technicalScore -= 15;
    addFix(
      "technical",
      "medium",
      `Page size is very large (${(pageSizeBytes / 1_048_576).toFixed(1)} MB) — optimize assets and enable compression.`
    );
  } else if (pageSizeBytes > 2_000_000) {
    technicalScore -= 8;
    addFix(
      "technical",
      "low",
      `Page size is ${(pageSizeBytes / 1024).toFixed(0)} KB — consider further optimization.`
    );
  }

  let onPageScore = 100;

  if (!meta.title) {
    onPageScore -= 25;
    addFix("onPage", "critical", "Title tag is missing — add a descriptive title (50–60 characters).");
  } else if (meta.titleLength < 30) {
    onPageScore -= 10;
    addFix("onPage", "medium", `Title too short (${meta.titleLength} chars) — expand to 50–60 characters.`);
  } else if (meta.titleLength > 70) {
    onPageScore -= 10;
    addFix("onPage", "medium", `Title too long (${meta.titleLength} chars) — trim to 50–60 characters.`);
  }

  if (!meta.description) {
    onPageScore -= 20;
    addFix("onPage", "high", "Meta description is missing — add a compelling description (120–160 characters).");
  } else if (meta.descriptionLength < 100) {
    onPageScore -= 8;
    addFix("onPage", "medium", `Meta description too short (${meta.descriptionLength} chars) — expand to 120–160.`);
  } else if (meta.descriptionLength > 170) {
    onPageScore -= 8;
    addFix("onPage", "medium", `Meta description too long (${meta.descriptionLength} chars) — trim to 120–160.`);
  }

  if (content.headings.h1 === 0) {
    onPageScore -= 20;
    addFix("onPage", "critical", "No H1 tag found — each page must have exactly one H1 heading.");
  } else if (content.headings.h1 > 1) {
    onPageScore -= 12;
    addFix("onPage", "high", `Multiple H1 tags found (${content.headings.h1}) — use only one H1 per page.`);
  }

  if (content.headings.h2 === 0 && content.wordCount > 300) {
    onPageScore -= 8;
    addFix("onPage", "medium", "No H2 tags found — use H2 headings to structure content sections.");
  }

  if (!meta.canonical) {
    onPageScore -= 7;
    addFix("onPage", "low", "Canonical URL not set — add a canonical link to prevent duplicate content issues.");
  }

  let contentScore = 100;

  if (content.wordCount < 300) {
    contentScore -= 25;
    addFix("content", "critical", `Very low word count (${content.wordCount}) — content pages should have 300+ words.`);
  } else if (content.wordCount < 600) {
    contentScore -= 12;
    addFix("content", "high", `Low word count (${content.wordCount}) — aim for 600+ words for comprehensive content.`);
  }

  if (content.images.total > 0) {
    const altRatio = content.images.withAlt / content.images.total;
    if (altRatio < 0.5) {
      contentScore -= 20;
      addFix("content", "high", `Only ${content.images.withAlt}/${content.images.total} images have alt text — add alt text to all images.`);
    } else if (altRatio < 0.9) {
      contentScore -= 8;
      addFix("content", "medium", `${content.images.total - content.images.withAlt} images missing alt text — add alt attributes for SEO and accessibility.`);
    }
  }

  if (content.links.internal < 3) {
    contentScore -= 8;
    addFix("content", "medium", "Very few internal links — improve site structure with more internal linking.");
  }

  let geoScore = 100;

  if (meta.schemaTypes.length === 0) {
    geoScore -= 25;
    addFix("geo", "critical", "No schema markup (JSON-LD) found — add structured data to improve AI engine visibility.");
  }

  if (content.headings.h1 === 0 && content.headings.h2 === 0) {
    geoScore -= 15;
    addFix("geo", "high", "No heading structure — a clear heading hierarchy helps AI engines understand content.");
  }

  if (content.wordCount < 600) {
    geoScore -= 15;
    addFix("geo", "medium", "Content may be too thin for AI-generated overviews — expand for comprehensive topic coverage.");
  }

  if (!meta.ogTitle && !meta.ogDescription) {
    geoScore -= 10;
    addFix("geo", "low", "Open Graph tags missing — add OG tags for better social and AI previews.");
  }

  if (meta.schemaTypes.length > 0 && meta.schemaTypes.length < 2) {
    geoScore -= 5;
    addFix("geo", "low", "Consider adding more schema types (Article, FAQ, BreadcrumbList) for richer AI visibility.");
  }

  const localScore = 50;
  const competitorScore = 50;

  const overall = Math.round(
    technicalScore * 0.20 +
    onPageScore * 0.25 +
    contentScore * 0.25 +
    geoScore * 0.20 +
    localScore * 0.05 +
    competitorScore * 0.05
  );

  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

  return {
    scores: {
      technical: clamp(technicalScore),
      onPage: clamp(onPageScore),
      content: clamp(contentScore),
      geo: clamp(geoScore),
      local: clamp(localScore),
      competitor: clamp(competitorScore),
      overall,
    },
    fixes,
  };
}

export async function scanWebsite(url: string): Promise<ScanResult> {
  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

  const htmlResponse = await fetchWithRetry(normalizedUrl);
  if (!htmlResponse.ok) {
    throw new Error(`Failed to fetch website: HTTP ${htmlResponse.status} ${htmlResponse.statusText}`);
  }
  const html = await htmlResponse.text();
  const pageSizeBytes = new TextEncoder().encode(html).length;

  const meta = parseMetaTags(html);
  const content = parseContent(html);

  const urlObj = new URL(normalizedUrl);
  const baseOrigin = `${urlObj.protocol}//${urlObj.host}`;

  let robotsTxtExists = false;
  let sitemapExists = false;

  try {
    const robotsRes = await fetchWithRetry(`${baseOrigin}/robots.txt`, 2, 10000);
    robotsTxtExists = robotsRes.ok;
    if (robotsTxtExists) {
      const robotsBody = await robotsRes.text();
      if (/sitemap:/i.test(robotsBody)) {
        sitemapExists = true;
      }
    }
  } catch (err) {
    console.warn(`[Scanner] Failed to fetch robots.txt:`, err instanceof Error ? err.message : err);
  }

  if (!sitemapExists) {
    try {
      const sitemapRes = await fetchWithRetry(`${baseOrigin}/sitemap.xml`, 2, 10000);
      sitemapExists = sitemapRes.ok;
    } catch (err) {
      console.warn(`[Scanner] Failed to fetch sitemap.xml:`, err instanceof Error ? err.message : err);
    }
  }

  const { scores, fixes } = calculateScores(
    normalizedUrl,
    meta,
    content,
    robotsTxtExists,
    sitemapExists,
    pageSizeBytes
  );

  return {
    id: crypto.randomUUID(),
    url: normalizedUrl,
    createdAt: new Date().toISOString(),
    status: "completed",
    scores,
    report: null,
    fixes,
    provider: "gemini",
  };
}
