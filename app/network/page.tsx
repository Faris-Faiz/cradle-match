import { Network } from "lucide-react";
import PageHeader from "@/components/page-header";
import OnboardingHint from "@/components/onboarding-hint";
import NetworkGraph, {
  type GraphEdge,
  type GraphNode,
} from "@/components/network-graph";
import {
  getCompanies,
  getMentors,
  getProgrammes,
  getPartners,
  getRelationships,
} from "@/lib/services/data";

export default async function NetworkPage() {
  const [companies, mentors, programmes, partners, relationships] =
    await Promise.all([
      getCompanies(),
      getMentors(),
      getProgrammes(),
      getPartners(),
      getRelationships(),
    ]);

  // Companies always appear; mentors / programmes / partners appear only once
  // they're actually connected to something, keeping the map readable.
  const referenced = new Set(relationships.map((r) => r.target_id));
  const nodes: GraphNode[] = [];

  for (const c of companies) {
    nodes.push({
      id: c.id,
      kind: "company",
      label: c.name,
      sublabel: `${c.sector} · ${c.stage}`,
      href: `/companies/${c.id}`,
    });
  }
  for (const m of mentors) {
    if (!referenced.has(m.id)) continue;
    nodes.push({ id: m.id, kind: "mentor", label: m.name, sublabel: m.headline });
  }
  for (const p of programmes) {
    if (!referenced.has(p.id)) continue;
    nodes.push({
      id: p.id,
      kind: "programme",
      label: p.name,
      sublabel: p.description,
    });
  }
  for (const p of partners) {
    if (!referenced.has(p.id)) continue;
    nodes.push({
      id: p.id,
      kind: "partner",
      label: p.org_name,
      sublabel: `${p.type} partner · ${p.warmth} relationship`,
    });
  }

  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges: GraphEdge[] = relationships
    .filter((r) => nodeIds.has(r.company_id) && nodeIds.has(r.target_id))
    .map((r) => ({
      id: r.id,
      source: r.company_id,
      target: r.target_id,
      active: r.state === "Active",
      scoreLabel: r.score ? `${Math.round(r.score * 100)}%` : undefined,
    }));

  return (
    <div className="mx-auto max-w-[1400px] p-8">
      <PageHeader
        icon={Network}
        title="Relationship Map"
        description="A live picture of how every startup, mentor, programme, and partner in your portfolio is connected."
        breadcrumb={[{ label: "Workspace" }, { label: "Relationship Map" }]}
      />

      <OnboardingHint id="network" title="This is your portfolio at a glance">
        Each dot is a company or a support resource. Lines connect the ones
        working together. Hover a dot to highlight its connections, click it to
        see details, or drag it around to untangle the view.
      </OnboardingHint>

      <NetworkGraph nodes={nodes} edges={edges} />
    </div>
  );
}
