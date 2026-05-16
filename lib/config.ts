// Each flag is true by default (mock). Set the env var to "false" to enable the live integration.

function flag(name: string): boolean {
  return process.env[name] !== "false";
}

export const config = {
  // Set MOCK_DATA_STORE=false to read/write Firestore instead of the in-memory store
  mockDataStore: flag("MOCK_DATA_STORE"),

  // Set MOCK_EXTRACTION=false to extract pitch deck profiles with Gemini 2.5 Pro
  mockExtraction: flag("MOCK_EXTRACTION"),

  // Set MOCK_ENRICHMENT=false to enrich CEO profiles via Apify LinkedIn scraper
  mockEnrichment: flag("MOCK_ENRICHMENT"),

  // Set MOCK_MATCHING=false to rank candidates with Gemini instead of keyword scoring
  mockMatching: flag("MOCK_MATCHING"),
} as const;
