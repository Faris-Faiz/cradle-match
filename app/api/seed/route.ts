import { config } from "@/lib/config";
import { getCompanies as mockCompanies, getMentors, getPartners, getProgrammes, getRelationships, getMilestones, getDrafts } from "@/lib/store";

// POST /api/seed — writes the mock seed data into Firestore.
// Only works when MOCK_DATA_STORE=false. Safe to call multiple times (uses set/merge).
export async function POST() {
  if (config.mockDataStore) {
    return Response.json({ error: "MOCK_DATA_STORE is true — seeding only applies to Firestore" }, { status: 400 });
  }

  // Dynamic require so firebase-admin is not loaded in mock mode
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getApps, initializeApp, cert } = require("firebase-admin/app");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getFirestore } = require("firebase-admin/firestore");

  if (!getApps().length) {
    const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    initializeApp({
      credential: credsJson
        ? cert(JSON.parse(Buffer.from(credsJson, "base64").toString("utf8")))
        : undefined,
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
    });
  }

  const db = getFirestore(process.env.FIRESTORE_DATABASE_ID ?? "(default)");

  async function seedCollection(name: string, items: { id: string }[]) {
    const batch = db.batch();
    for (const item of items) {
      const { id, ...rest } = item;
      batch.set(db.collection(name).doc(id), rest, { merge: true });
    }
    await batch.commit();
    return items.length;
  }

  const counts = await Promise.all([
    seedCollection("companies", mockCompanies()),
    seedCollection("mentors", getMentors()),
    seedCollection("partners", getPartners()),
    seedCollection("programmes", getProgrammes()),
    seedCollection("relationships", getRelationships()),
    seedCollection("milestones", getMilestones()),
    seedCollection("drafts", getDrafts()),
  ]);

  const collections = ["companies", "mentors", "partners", "programmes", "relationships", "milestones", "drafts"];
  const result = Object.fromEntries(collections.map((c, i) => [c, counts[i]]));

  return Response.json({ seeded: result });
}
