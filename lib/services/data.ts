import { config } from "@/lib/config";
import * as store from "@/lib/store";
import type {
  Company, Mentor, Partner, Programme,
  Relationship, Milestone, EmailDraft, CandidatesResult,
} from "@/lib/types";

// ── Firestore client (lazy, only initialised when MOCK_DATA_STORE=false) ─────

function getDb() {
  // Dynamic require keeps firebase-admin out of the bundle when using mock mode.
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

  return getFirestore(process.env.FIRESTORE_DATABASE_ID ?? "(default)");
}

async function col<T>(collection: string): Promise<T[]> {
  const db = getDb();
  const snap = await db.collection(collection).get();
  return snap.docs.map((d: { id: string; data: () => object }) => ({ id: d.id, ...d.data() })) as T[];
}

async function doc<T>(collection: string, id: string): Promise<T | undefined> {
  const db = getDb();
  const snap = await db.collection(collection).doc(id).get();
  if (!snap.exists) return undefined;
  return { id: snap.id, ...snap.data() } as T;
}

async function setDoc(collection: string, id: string, data: object): Promise<void> {
  const db = getDb();
  await db.collection(collection).doc(id).set(data, { merge: true });
}

async function addDoc<T extends { id: string }>(collection: string, data: Omit<T, "id"> & { id: string }): Promise<T> {
  const db = getDb();
  const { id, ...rest } = data;
  await db.collection(collection).doc(id).set(rest);
  return data as T;
}

// ── Public API — same shape as lib/store but all async ────────────────────────

export async function getCompanies(): Promise<Company[]> {
  if (config.mockDataStore) return Promise.resolve(store.getCompanies());
  return col<Company>("companies");
}

export async function getCompany(id: string): Promise<Company | undefined> {
  if (config.mockDataStore) return Promise.resolve(store.getCompany(id));
  return doc<Company>("companies", id);
}

export async function getMentors(): Promise<Mentor[]> {
  if (config.mockDataStore) return Promise.resolve(store.getMentors());
  return col<Mentor>("mentors");
}

export async function getMentor(id: string): Promise<Mentor | undefined> {
  if (config.mockDataStore) return Promise.resolve(store.getMentor(id));
  return doc<Mentor>("mentors", id);
}

export async function getPartners(): Promise<Partner[]> {
  if (config.mockDataStore) return Promise.resolve(store.getPartners());
  return col<Partner>("partners");
}

export async function getPartner(id: string): Promise<Partner | undefined> {
  if (config.mockDataStore) return Promise.resolve(store.getPartner(id));
  return doc<Partner>("partners", id);
}

export async function getProgrammes(): Promise<Programme[]> {
  if (config.mockDataStore) return Promise.resolve(store.getProgrammes());
  return col<Programme>("programmes");
}

export async function getProgramme(id: string): Promise<Programme | undefined> {
  if (config.mockDataStore) return Promise.resolve(store.getProgramme(id));
  return doc<Programme>("programmes", id);
}

export async function getRelationships(companyId?: string): Promise<Relationship[]> {
  if (config.mockDataStore) {
    const all = store.getRelationships();
    return Promise.resolve(companyId ? all.filter(r => r.company_id === companyId) : all);
  }
  const db = getDb();
  let q = db.collection("relationships").orderBy("created_at", "desc");
  if (companyId) q = q.where("company_id", "==", companyId) as typeof q;
  const snap = await q.get();
  return snap.docs.map((d: { id: string; data: () => object }) => ({ id: d.id, ...d.data() })) as Relationship[];
}

export async function getRelationship(id: string): Promise<Relationship | undefined> {
  if (config.mockDataStore) return Promise.resolve(store.getRelationship(id));
  return doc<Relationship>("relationships", id);
}

export async function getMilestones(companyId?: string): Promise<Milestone[]> {
  if (config.mockDataStore) {
    const all = store.getMilestones();
    return Promise.resolve(companyId ? all.filter(m => m.company_id === companyId) : all);
  }
  const db = getDb();
  let q = db.collection("milestones").orderBy("target_date");
  if (companyId) q = q.where("company_id", "==", companyId) as typeof q;
  const snap = await q.get();
  return snap.docs.map((d: { id: string; data: () => object }) => ({ id: d.id, ...d.data() })) as Milestone[];
}

export async function getDrafts(relationshipId?: string): Promise<EmailDraft[]> {
  if (config.mockDataStore) {
    const all = store.getDrafts();
    return Promise.resolve(relationshipId ? all.filter(d => d.relationship_id === relationshipId) : all);
  }
  const db = getDb();
  let q = db.collection("drafts");
  if (relationshipId) q = q.where("relationship_id", "==", relationshipId) as typeof q;
  const snap = await (q as ReturnType<typeof db.collection>).get();
  return snap.docs.map((d: { id: string; data: () => object }) => ({ id: d.id, ...d.data() })) as EmailDraft[];
}

export async function getCandidates(companyId: string): Promise<CandidatesResult | undefined> {
  if (config.mockDataStore) return Promise.resolve(store.getCandidates(companyId));
  return doc<CandidatesResult>("candidates", companyId);
}

export async function createCompany(data: Omit<Company, "id" | "created_at" | "created_by">): Promise<Company> {
  if (config.mockDataStore) return Promise.resolve(store.createCompany(data));
  const companies = await getCompanies();
  const company: Company = {
    ...data,
    id: `co-${String(companies.length + 1).padStart(3, "0")}`,
    created_at: new Date().toISOString(),
    created_by: "labubu@cradle.com.my",
  };
  await addDoc("companies", company);
  return company;
}

export async function updateCompany(id: string, patch: Partial<Company>): Promise<Company | null> {
  if (config.mockDataStore) return Promise.resolve(store.updateCompany(id, patch));
  const existing = await getCompany(id);
  if (!existing) return null;
  const updated = { ...existing, ...patch };
  await setDoc("companies", id, updated);
  return updated;
}

export async function saveCandidates(result: CandidatesResult): Promise<void> {
  if (config.mockDataStore) { store.saveCandidates(result); return; }
  await setDoc("candidates", result.company_id, result);
}

export async function createRelationship(data: Omit<Relationship, "id" | "created_at">): Promise<Relationship> {
  if (config.mockDataStore) return Promise.resolve(store.createRelationship(data));
  const all = await getRelationships();
  const rel: Relationship = {
    ...data,
    id: `rel-${String(all.length + 1).padStart(3, "0")}`,
    created_at: new Date().toISOString(),
  };
  await addDoc("relationships", rel);
  return rel;
}

export async function updateRelationship(id: string, patch: Partial<Relationship>): Promise<Relationship | null> {
  if (config.mockDataStore) return Promise.resolve(store.updateRelationship(id, patch));
  const existing = await getRelationship(id);
  if (!existing) return null;
  const updated = { ...existing, ...patch };
  await setDoc("relationships", id, updated);
  return updated;
}

export async function createMilestones(milestones: Omit<Milestone, "id" | "created_at">[]): Promise<Milestone[]> {
  if (config.mockDataStore) return Promise.resolve(store.createMilestones(milestones));
  const all = await getMilestones();
  const created = await Promise.all(
    milestones.map(async (m, i) => {
      const milestone: Milestone = {
        ...m,
        id: `ms-${String(all.length + i + 1).padStart(3, "0")}`,
        created_at: new Date().toISOString(),
      };
      await addDoc("milestones", milestone);
      return milestone;
    })
  );
  return created;
}

export async function updateMilestone(id: string, patch: Partial<Milestone>): Promise<Milestone | null> {
  if (config.mockDataStore) return Promise.resolve(store.updateMilestone(id, patch));
  const existing = await doc<Milestone>("milestones", id);
  if (!existing) return null;
  const updated = { ...existing, ...patch };
  await setDoc("milestones", id, updated);
  return updated;
}

export async function saveDraft(draft: Omit<EmailDraft, "id">): Promise<EmailDraft> {
  if (config.mockDataStore) return Promise.resolve(store.saveDraft(draft));
  const all = await getDrafts();
  const created: EmailDraft = {
    ...draft,
    id: `dr-${String(all.length + 1).padStart(3, "0")}`,
  };
  await addDoc("drafts", created);
  return created;
}

export async function updateDraft(id: string, patch: Partial<EmailDraft>): Promise<EmailDraft | null> {
  if (config.mockDataStore) return Promise.resolve(store.updateDraft(id, patch));
  const existing = await doc<EmailDraft>("drafts", id);
  if (!existing) return null;
  const updated = { ...existing, ...patch };
  await setDoc("drafts", id, updated);
  return updated;
}
