import type {
  Company, Mentor, Partner, Programme, Relationship,
  Milestone, EmailDraft, CandidatesResult,
} from "./types";

interface Store {
  companies: Company[];
  mentors: Mentor[];
  partners: Partner[];
  programmes: Programme[];
  relationships: Relationship[];
  milestones: Milestone[];
  drafts: EmailDraft[];
  candidates: CandidatesResult[];
}

declare global {
  var __cradleStore: Store | undefined;
}

function seedStore(): Store {
  const companies: Company[] = [
    {
      id: "co-001",
      name: "NutriTech",
      sector: "Food Tech",
      stage: "Series A",
      founded_year: 2021,
      ceo_name: "Aigerim Bekova",
      ceo_linkedin_url: "https://linkedin.com/in/aigerim-bekova",
      ceo_profile: {
        headline: "CEO & Co-Founder at NutriTech | ex-Nestlé | Forbes 30 Under 30",
        current_role: "Chief Executive Officer, NutriTech",
        education: ["MSc Food Science, University of Wageningen", "BSc Biochemistry, UM"],
        past_roles: ["Product Manager, Nestlé MENA", "Research Scientist, Mondelēz"],
      },
      funding_rationale: "NutriTech's AI-driven personalised nutrition engine addresses a $3B gap in the Southeast Asian B2B food manufacturing market. The team's unique combination of food science PhDs and enterprise sales experience de-risks both product and go-to-market. Cradle is backing to accelerate their FMCG distribution partnerships and expand from Malaysia to Indonesia.",
      needs: ["FMCG distribution partnerships", "Enterprise sales strategy", "Regulatory compliance (BPOM Indonesia)", "Series B preparation"],
      pitch_deck_url: "gs://cradle-decks/nutritech-series-a.pdf",
      created_at: "2026-02-10T08:00:00Z",
      created_by: "labubu@cradle.com.my",
    },
    {
      id: "co-002",
      name: "HealthGuard",
      sector: "MedTech",
      stage: "Seed",
      founded_year: 2022,
      ceo_name: "Dr. Roshan Nair",
      ceo_linkedin_url: "https://linkedin.com/in/roshan-nair-medtech",
      ceo_profile: {
        headline: "Founder & CEO, HealthGuard | Medical Doctor | Digital Health Pioneer",
        current_role: "Chief Executive Officer, HealthGuard",
        education: ["MBBS, University of Malaya", "MPH, Johns Hopkins (Bloomberg)"],
        past_roles: ["Emergency Physician, HKL", "Medical Affairs Lead, Roche Malaysia"],
      },
      funding_rationale: "HealthGuard's wearable vitals monitoring platform for rural clinics has demonstrated 94% diagnostic accuracy in a 500-patient pilot with KKM. Cradle is funding the CE/FDA submission pathway and hospital system integrations to unlock a $200M addressable market across ASEAN public health infrastructure.",
      needs: ["FDA/CE regulatory pathway", "Hospital IT integration (HL7, FHIR)", "Clinical validation partnerships", "Series A fundraising narrative"],
      pitch_deck_url: "gs://cradle-decks/healthguard-seed.pdf",
      created_at: "2026-02-18T09:30:00Z",
      created_by: "labubu@cradle.com.my",
    },
    {
      id: "co-003",
      name: "EduFlow",
      sector: "EdTech",
      stage: "Pre-Series A",
      founded_year: 2020,
      ceo_name: "Mei Lin Tan",
      ceo_linkedin_url: "https://linkedin.com/in/meilin-tan-eduflow",
      ceo_profile: {
        headline: "CEO, EduFlow | Formerly MOE | Reimagining K-12 with AI",
        current_role: "Chief Executive Officer, EduFlow",
        education: ["MEd Education Technology, NUS", "BEd, UPM"],
        past_roles: ["Curriculum Specialist, MOE Malaysia", "Learning Designer, Teach For Malaysia"],
      },
      funding_rationale: "EduFlow's adaptive learning platform has achieved 40% improvement in UPSR math outcomes across 120 pilot schools in Sabah and Sarawak. Cradle is backing the platform to scale to 800 schools nationally and develop a B2G revenue model with MOE, while building the content library for secondary-level subjects.",
      needs: ["MOE procurement process navigation", "B2G sales strategy", "Content partnership with publishers", "CTO hire for platform scaling"],
      pitch_deck_url: "gs://cradle-decks/eduflow-pre-a.pdf",
      created_at: "2026-03-01T10:00:00Z",
      created_by: "labubu@cradle.com.my",
    },
    {
      id: "co-004",
      name: "ClimateSmart",
      sector: "CleanTech",
      stage: "Seed",
      founded_year: 2023,
      ceo_name: "Hafiz Rahman",
      ceo_linkedin_url: "https://linkedin.com/in/hafiz-rahman-climatesmart",
      ceo_profile: {
        headline: "Founder, ClimateSmart | Climate Engineer | Yayasan Khazanah Scholar",
        current_role: "Chief Executive Officer, ClimateSmart",
        education: ["MEng Environmental Engineering, Imperial College London", "BEng, UTM"],
        past_roles: ["Process Engineer, Petronas", "ESG Consultant, PwC Malaysia"],
      },
      funding_rationale: "ClimateSmart's IoT-based carbon monitoring system for SME manufacturers provides the first affordable Scope 1+2 tracking solution tailored for Malaysia's export-oriented industries facing EU CBAM compliance by 2026. Cradle is funding to close 5 anchor pilot contracts and build the MRV certification pipeline.",
      needs: ["EU CBAM compliance expertise", "Carbon credit certification (Verra/Gold Standard)", "Manufacturing sector partnerships", "Grant funding (MIDA, Green Tech Corp)"],
      pitch_deck_url: "gs://cradle-decks/climatesmart-seed.pdf",
      created_at: "2026-03-15T11:00:00Z",
      created_by: "labubu@cradle.com.my",
    },
    {
      id: "co-005",
      name: "FinCore",
      sector: "FinTech",
      stage: "Series A",
      founded_year: 2021,
      ceo_name: "Priya Sundaram",
      ceo_linkedin_url: "https://linkedin.com/in/priya-sundaram-fincore",
      ceo_profile: {
        headline: "CEO, FinCore | ex-Maybank | BNM FinTech Cohort Alumni",
        current_role: "Chief Executive Officer, FinCore",
        education: ["MBA, INSEAD", "BCom Finance, University of Melbourne"],
        past_roles: ["VP Digital Banking, Maybank", "Strategy Manager, GXBank"],
      },
      funding_rationale: "FinCore's embedded lending API enables licensed non-bank lenders to offer SME working capital within any B2B marketplace. With BNM's new Digital Credit Market Framework, FinCore is positioned to be the infrastructure layer for Malaysia's $8B alternative lending market. Cradle is funding BNM licensing and the sales team to close 3 anchor marketplace partners.",
      needs: ["BNM licensing strategy", "Banking API integration partners", "Enterprise sales (marketplace platforms)", "CFO hire for Series B"],
      pitch_deck_url: "gs://cradle-decks/fincore-series-a.pdf",
      created_at: "2026-04-01T08:00:00Z",
      created_by: "labubu@cradle.com.my",
    },
  ];

  const mentors: Mentor[] = [
    {
      id: "mn-001",
      name: "Dato' Syed Amin Aljeffri",
      headline: "Former CEO, Aeon Malaysia | FMCG & Retail Distribution Expert",
      expertise: ["FMCG distribution", "Retail strategy", "Supply chain", "Indonesia market entry"],
      stage_experience: ["Series A", "Series B+"],
      languages: ["English", "Bahasa Malaysia", "Bahasa Indonesia"],
      bio: "35 years building distribution networks across SEA, including Aeon's RM2B Malaysia retail operation. Led market entry into Indonesia and Thailand for 3 FMCG brands.",
      linkedin_url: "https://linkedin.com/in/syed-amin-aljeffri",
      avatar_initials: "SA",
    },
    {
      id: "mn-002",
      name: "Dr. Patricia Wong",
      headline: "Ex-CEO Health Quest | MedTech Regulatory & Hospital Systems",
      expertise: ["FDA/CE marking", "Hospital procurement", "Clinical trials", "HL7/FHIR integration"],
      stage_experience: ["Seed", "Pre-Series A", "Series A"],
      languages: ["English", "Mandarin", "Cantonese"],
      bio: "Led regulatory submissions for 7 medical devices in US and EU markets. Former Chief Medical Officer at a NASDAQ-listed digital health company.",
      linkedin_url: "https://linkedin.com/in/patricia-wong-medtech",
      avatar_initials: "PW",
    },
    {
      id: "mn-003",
      name: "Kamarul Ariffin",
      headline: "Founder, AirAsia Academy | EdTech & B2G Sales Veteran",
      expertise: ["Government procurement", "B2G sales", "Curriculum development", "EdTech scaling"],
      stage_experience: ["Pre-Seed", "Seed", "Pre-Series A"],
      languages: ["English", "Bahasa Malaysia"],
      bio: "Built and scaled AirAsia Academy to 500K learners, navigating complex government partnership agreements across 5 ministries in Malaysia and Indonesia.",
      linkedin_url: "https://linkedin.com/in/kamarul-ariffin",
      avatar_initials: "KA",
    },
    {
      id: "mn-004",
      name: "Ing. Sarah de Vries",
      headline: "Ex-Shell | CleanTech & Carbon Markets Specialist",
      expertise: ["Carbon markets", "EU CBAM", "MRV certification", "ESG reporting", "CBAM compliance"],
      stage_experience: ["Seed", "Pre-Series A"],
      languages: ["English", "Dutch", "Bahasa Malaysia"],
      bio: "15 years in Shell's sustainability division. Architected carbon monitoring frameworks for 3 major ASEAN industrial clusters. IPCC contributing author on industrial emissions.",
      linkedin_url: "https://linkedin.com/in/sarah-devries-cleantech",
      avatar_initials: "SV",
    },
    {
      id: "mn-005",
      name: "Tan Sri Ahmad Fadzli",
      headline: "Former BNM Deputy Governor | FinTech Regulation & Digital Banking",
      expertise: ["BNM licensing", "Digital banking regulation", "Financial inclusion", "Embedded finance"],
      stage_experience: ["Series A", "Series B+"],
      languages: ["English", "Bahasa Malaysia", "Arabic"],
      bio: "25 years at Bank Negara Malaysia, including steering Malaysia's Open Finance Framework. Board advisor to 4 licensed fintech companies and 2 regional digital banks.",
      linkedin_url: "https://linkedin.com/in/ahmad-fadzli-bnm",
      avatar_initials: "AF",
    },
    {
      id: "mn-006",
      name: "Jeanie Lim",
      headline: "Managing Partner, Jungle Ventures | B2B SaaS & Series A Fundraising",
      expertise: ["Series A fundraising", "B2B SaaS metrics", "Investor relations", "Go-to-market SEA"],
      stage_experience: ["Pre-Series A", "Series A"],
      languages: ["English", "Mandarin"],
      bio: "Led 22 Series A investments at Jungle Ventures. Previously VP Product at a NYSE-listed SaaS company. Specialises in helping founders build investor-grade narratives.",
      linkedin_url: "https://linkedin.com/in/jeanie-lim-vc",
      avatar_initials: "JL",
    },
    {
      id: "mn-007",
      name: "Prof. Dr. Malik Hassan",
      headline: "UTM Research Chair | IoT & Industrial Sensor Systems",
      expertise: ["IoT architecture", "Industrial sensors", "Data pipeline", "Edge computing"],
      stage_experience: ["Pre-Seed", "Seed"],
      languages: ["English", "Bahasa Malaysia", "Arabic"],
      bio: "Leads UTM's Smart Manufacturing Lab with 40 researchers. Has commercialised 3 IoT patents with Petronas and Top Glove. Deep network in Malaysian manufacturing sector.",
      linkedin_url: "https://linkedin.com/in/malik-hassan-utm",
      avatar_initials: "MH",
    },
    {
      id: "mn-008",
      name: "Lisa Chen",
      headline: "CTO, Grab Financial | Payments API & Banking Integration",
      expertise: ["Banking API", "Payments infrastructure", "Marketplace lending", "Open Finance"],
      stage_experience: ["Series A", "Series B+"],
      languages: ["English", "Mandarin", "Bahasa Malaysia"],
      bio: "Built Grab Financial's lending infrastructure from 0 to $1B disbursements. Architect of the GXBank core banking system. Expert in Malaysia's API banking standards.",
      linkedin_url: "https://linkedin.com/in/lisa-chen-grab",
      avatar_initials: "LC",
    },
    {
      id: "mn-009",
      name: "Dr. Amir Yusuf",
      headline: "Founder, BioNexus Fellow | Food Science & Halal Certification",
      expertise: ["Halal certification", "Food safety (HACCP)", "Functional ingredients", "JAKIM compliance"],
      stage_experience: ["Seed", "Pre-Series A", "Series A"],
      languages: ["English", "Bahasa Malaysia", "Arabic"],
      bio: "Holds 12 food technology patents. Led R&D at Nestle Malaysia for 10 years. Advisors to JAKIM's Halal Certification Technical Committee. Expert in functional food formulation.",
      linkedin_url: "https://linkedin.com/in/amir-yusuf-food",
      avatar_initials: "AY",
    },
    {
      id: "mn-010",
      name: "Kavita Rajendran",
      headline: "ex-McKinsey | Enterprise Sales & Market Expansion SEA",
      expertise: ["Enterprise sales", "GTM strategy", "Indonesia expansion", "B2B pricing"],
      stage_experience: ["Series A", "Series B+"],
      languages: ["English", "Tamil", "Bahasa Indonesia"],
      bio: "10 years at McKinsey's Digital & Analytics practice in Jakarta and KL. Led market entry strategies for 5 enterprise SaaS companies into SEA. Built and coached 50-person sales teams.",
      linkedin_url: "https://linkedin.com/in/kavita-rajendran-mckinsey",
      avatar_initials: "KR",
    },
    {
      id: "mn-011",
      name: "Zainudin Ishak",
      headline: "Chairman, MIDA Advisory | Manufacturing & Industry 4.0",
      expertise: ["MIDA grants", "Manufacturing sector", "Industry 4.0", "Export compliance"],
      stage_experience: ["Seed", "Pre-Series A"],
      languages: ["English", "Bahasa Malaysia"],
      bio: "Former MIDA Director-General. Facilitated over RM4B in approved manufacturing investments. Deep relationships across MOI, MITI, and major industrial estate operators.",
      linkedin_url: "https://linkedin.com/in/zainudin-ishak-mida",
      avatar_initials: "ZI",
    },
    {
      id: "mn-012",
      name: "Dr. Nurul Huda Mohd Rashid",
      headline: "VP Clinical Affairs, IHH Healthcare | Hospital Procurement",
      expertise: ["Hospital procurement", "Clinical validation", "MOH Malaysia", "Private hospital networks"],
      stage_experience: ["Seed", "Pre-Series A"],
      languages: ["English", "Bahasa Malaysia"],
      bio: "Led procurement decisions for 12 hospitals across IHH Malaysia (Pantai, Gleneagles). Expert in MedTech clinical evidence requirements for both MOH and private hospital tenders.",
      linkedin_url: "https://linkedin.com/in/nurul-huda-ihh",
      avatar_initials: "NH",
    },
    {
      id: "mn-013",
      name: "Ong Beng Seng",
      headline: "ex-Axiata Digital | B2B2C Marketplace & Embedded Finance",
      expertise: ["Marketplace platforms", "Embedded finance", "API monetisation", "Telco-fintech"],
      stage_experience: ["Series A", "Series B+"],
      languages: ["English", "Mandarin", "Bahasa Malaysia"],
      bio: "Built Axiata Digital's regional marketplace lending product covering 3 countries and $200M in disbursements. Former board member of Boost Holdings.",
      linkedin_url: "https://linkedin.com/in/ong-beng-seng-axiata",
      avatar_initials: "OB",
    },
    {
      id: "mn-014",
      name: "Fatimah Al-Zahra",
      headline: "Climate Finance Director, HSBC ASEAN | Green Bonds & Carbon Finance",
      expertise: ["Climate finance", "Carbon credits", "Green bonds", "Sustainability reporting"],
      stage_experience: ["Seed", "Pre-Series A", "Series A"],
      languages: ["English", "Bahasa Malaysia", "Arabic"],
      bio: "Structured $2.5B in green bonds and sustainability-linked loans across ASEAN. Pioneer of Malaysia's Green Finance Taxonomy implementation with SC and BNM.",
      linkedin_url: "https://linkedin.com/in/fatimah-alzahra-climate",
      avatar_initials: "FZ",
    },
    {
      id: "mn-015",
      name: "Dr. Rajesh Menon",
      headline: "CTO, Telekom Malaysia | Cloud Infrastructure & API Platforms",
      expertise: ["Cloud architecture", "API platforms", "Enterprise SaaS", "System integration"],
      stage_experience: ["Pre-Series A", "Series A"],
      languages: ["English", "Tamil", "Bahasa Malaysia"],
      bio: "Oversaw TM's digital transformation to cloud-native infrastructure serving 2M enterprise customers. Expert in building scalable API-first platforms for enterprise integration.",
      linkedin_url: "https://linkedin.com/in/rajesh-menon-tm",
      avatar_initials: "RM",
    },
  ];

  const partners: Partner[] = [
    {
      id: "pa-001",
      org_name: "Aeon Co. (M) Bhd",
      type: "corporate",
      focus_sectors: ["Food Tech", "Consumer"],
      deal_types: ["Distribution agreement", "Shelf placement pilot", "Co-development"],
      warmth: "warm",
      contact_email: "partnerships@aeon.com.my",
    },
    {
      id: "pa-002",
      org_name: "IHH Healthcare Malaysia",
      type: "corporate",
      focus_sectors: ["MedTech", "HealthTech"],
      deal_types: ["Pilot agreement", "Procurement tender", "Clinical validation"],
      warmth: "existing",
      contact_email: "innovation@ihh.com.my",
    },
    {
      id: "pa-003",
      org_name: "Kementerian Pendidikan Malaysia (MOE)",
      type: "corporate",
      focus_sectors: ["EdTech"],
      deal_types: ["Government procurement", "Pilot programme", "MOU"],
      warmth: "warm",
      contact_email: "digital@moe.gov.my",
    },
    {
      id: "pa-004",
      org_name: "Petronas Ventures",
      type: "vc",
      focus_sectors: ["CleanTech", "Energy", "Industrial IoT"],
      deal_types: ["Investment", "Pilot contract", "Technology licensing"],
      warmth: "warm",
      contact_email: "ventures@petronas.com.my",
    },
    {
      id: "pa-005",
      org_name: "Maybank Innovation Lab",
      type: "corporate",
      focus_sectors: ["FinTech", "Payments"],
      deal_types: ["API partnership", "Pilot programme", "Commercial agreement"],
      warmth: "existing",
      contact_email: "innovation@maybank.com.my",
    },
    {
      id: "pa-006",
      org_name: "Green Tech Corporation Malaysia",
      type: "lab",
      focus_sectors: ["CleanTech", "Sustainability"],
      deal_types: ["Grant funding", "Co-certification", "Pilot project"],
      warmth: "warm",
      contact_email: "grants@greentechcorp.com.my",
    },
    {
      id: "pa-007",
      org_name: "Telekom Malaysia (TM)",
      type: "corporate",
      focus_sectors: ["EdTech", "FinTech", "SaaS"],
      deal_types: ["API integration", "Bundled service", "Distribution"],
      warmth: "warm",
      contact_email: "enterprise@telekom.com.my",
    },
    {
      id: "pa-008",
      org_name: "Malaysian Genome Institute (MGI)",
      type: "lab",
      focus_sectors: ["MedTech", "Biotech", "Food Tech"],
      deal_types: ["Research collaboration", "Clinical data sharing", "Co-publication"],
      warmth: "cold",
      contact_email: "partnerships@mgi.gov.my",
    },
    {
      id: "pa-009",
      org_name: "RHB Ventures",
      type: "vc",
      focus_sectors: ["FinTech", "EdTech"],
      deal_types: ["Investment", "Distribution pilot", "Strategic partnership"],
      warmth: "warm",
      contact_email: "ventures@rhb.com.my",
    },
    {
      id: "pa-010",
      org_name: "Pos Malaysia Berhad",
      type: "distributor",
      focus_sectors: ["Food Tech", "Consumer", "FinTech"],
      deal_types: ["Last-mile distribution", "Agent network", "Co-branding"],
      warmth: "cold",
      contact_email: "partnerships@pos.com.my",
    },
  ];

  const programmes: Programme[] = [
    {
      id: "pr-001",
      name: "Fast Track",
      stage_focus: ["Series A", "Pre-Series A"],
      sector_focus: ["FinTech", "Food Tech", "SaaS"],
      support_type: ["Market expansion", "Enterprise sales", "Series B preparation"],
      description: "High-intensity 6-month programme for revenue-generating startups ready to scale. Focus on enterprise pipeline building, international expansion, and Series B readiness.",
    },
    {
      id: "pr-002",
      name: "Deep Tech",
      stage_focus: ["Pre-Seed", "Seed", "Pre-Series A"],
      sector_focus: ["MedTech", "CleanTech", "Biotech", "Industrial IoT"],
      support_type: ["R&D grants", "IP strategy", "Regulatory pathways", "University partnerships"],
      description: "12-month programme for science-led startups with complex regulatory or certification requirements. Includes dedicated MIDA/MDEC grant facilitation and research lab partnerships.",
    },
    {
      id: "pr-003",
      name: "Market Access",
      stage_focus: ["Seed", "Pre-Series A", "Series A"],
      sector_focus: ["EdTech", "HealthTech", "Consumer", "CleanTech"],
      support_type: ["Government procurement", "Pilot partnerships", "Distribution networks", "MOUs"],
      description: "9-month programme focused on securing first anchor customers in government and large enterprise segments. Includes warm introductions to Kementerian procurement officers and GLC procurement teams.",
    },
  ];

  const relationships: Relationship[] = [
    {
      id: "rel-001",
      company_id: "co-001",
      target_type: "mentor",
      target_id: "mn-001",
      state: "Active",
      rationale: {
        skill_fit: { score: 5, reason: "35-year FMCG distribution track record directly maps to NutriTech's need for Indonesia market entry" },
        stage_fit: { score: 4, reason: "Led 2 brands through Series A-to-B transitions with distribution as core growth lever" },
        chemistry: { score: 4, reason: "Shared Bahasa Malaysia fluency and regional market intuition; both founders' network overlaps suggest warm common ground" },
        goal_alignment: { score: 5, reason: "Mentor's specific Aeon Indonesia playbook addresses NutriTech's most critical 12-month objective" },
      },
      score: 0.92,
      created_at: "2026-02-15T10:00:00Z",
      activated_at: "2026-02-17T14:00:00Z",
    },
    {
      id: "rel-002",
      company_id: "co-001",
      target_type: "programme",
      target_id: "pr-001",
      state: "Active",
      created_at: "2026-02-15T10:00:00Z",
      activated_at: "2026-02-17T14:00:00Z",
    },
    {
      id: "rel-003",
      company_id: "co-002",
      target_type: "mentor",
      target_id: "mn-002",
      state: "Active",
      rationale: {
        skill_fit: { score: 5, reason: "FDA/CE marking expertise is the exact regulatory pathway HealthGuard needs for US and EU expansion" },
        stage_fit: { score: 5, reason: "Specialist experience with Seed-stage medical devices navigating first regulatory submissions" },
        chemistry: { score: 3, reason: "Professional backgrounds differ but complementary — technical founder benefits from mentor's clinical-commercial bridge experience" },
        goal_alignment: { score: 5, reason: "Mentor's hospital procurement network at IHH directly serves HealthGuard's institutional sales goal" },
      },
      score: 0.90,
      created_at: "2026-02-25T10:00:00Z",
      activated_at: "2026-02-27T09:00:00Z",
    },
    {
      id: "rel-004",
      company_id: "co-003",
      target_type: "mentor",
      target_id: "mn-003",
      state: "Active",
      rationale: {
        skill_fit: { score: 5, reason: "Unique expertise in navigating KPM/MOE procurement cycles matches EduFlow's primary bottleneck" },
        stage_fit: { score: 4, reason: "Built AirAsia Academy at Pre-Series A stage with same B2G go-to-market challenge" },
        chemistry: { score: 5, reason: "Both have MOE background; education sector network overlap creates immediate warm introduction opportunities" },
        goal_alignment: { score: 5, reason: "Mentor's existing MOE relationships can accelerate EduFlow's 800-school target by 18 months" },
      },
      score: 0.94,
      created_at: "2026-03-05T10:00:00Z",
      activated_at: "2026-03-07T11:00:00Z",
    },
    {
      id: "rel-005",
      company_id: "co-004",
      target_type: "mentor",
      target_id: "mn-004",
      state: "Active",
      rationale: {
        skill_fit: { score: 5, reason: "EU CBAM compliance expertise is uniquely matched to ClimateSmart's most urgent market requirement" },
        stage_fit: { score: 4, reason: "Worked with multiple Seed-stage CleanTech companies through their first carbon certification" },
        chemistry: { score: 4, reason: "Engineering backgrounds align; both have Petronas ecosystem exposure creating shared vocabulary" },
        goal_alignment: { score: 5, reason: "MRV certification pipeline design directly addresses ClimateSmart's product credibility blocker" },
      },
      score: 0.91,
      created_at: "2026-03-20T10:00:00Z",
      activated_at: "2026-03-22T10:00:00Z",
    },
    // ── Historical engagements (Closed) — past-cohort pairings whose milestone
    //    outcomes feed the matching agents' learning loop ──
    {
      id: "rel-006",
      company_id: "co-001",
      target_type: "mentor",
      target_id: "mn-010",
      state: "Closed",
      score: 0.88,
      created_at: "2025-06-10T10:00:00Z",
      activated_at: "2025-06-12T10:00:00Z",
    },
    {
      id: "rel-007",
      company_id: "co-001",
      target_type: "mentor",
      target_id: "mn-009",
      state: "Closed",
      score: 0.81,
      created_at: "2025-07-01T10:00:00Z",
      activated_at: "2025-07-03T10:00:00Z",
    },
    {
      id: "rel-008",
      company_id: "co-002",
      target_type: "mentor",
      target_id: "mn-012",
      state: "Closed",
      score: 0.90,
      created_at: "2025-05-15T10:00:00Z",
      activated_at: "2025-05-17T10:00:00Z",
    },
    {
      id: "rel-009",
      company_id: "co-005",
      target_type: "mentor",
      target_id: "mn-005",
      state: "Closed",
      score: 0.86,
      created_at: "2025-08-20T10:00:00Z",
      activated_at: "2025-08-22T10:00:00Z",
    },
    {
      id: "rel-010",
      company_id: "co-003",
      target_type: "programme",
      target_id: "pr-003",
      state: "Closed",
      score: 0.84,
      created_at: "2025-04-10T10:00:00Z",
      activated_at: "2025-04-12T10:00:00Z",
    },
  ];

  const milestones: Milestone[] = [
    {
      id: "ms-001",
      company_id: "co-001",
      relationship_id: "rel-001",
      title: "Close 2 FMCG distribution pilots in Klang Valley",
      description: "Secure signed pilot agreements with at least 2 mid-sized FMCG distributors in KV, with minimum 3-month trial order commitment",
      target_date: "2026-04-30",
      quarter: "Q2 2026",
      status: "on_track",
      source: "ai_drafted",
      created_at: "2026-02-17T14:00:00Z",
    },
    {
      id: "ms-002",
      company_id: "co-001",
      relationship_id: "rel-001",
      title: "Indonesia market scoping report delivered",
      description: "Complete regulatory landscape, distribution partner shortlist, and TAM analysis for PT NutriTech Indonesia entity",
      target_date: "2026-05-31",
      quarter: "Q2 2026",
      status: "on_track",
      source: "ai_drafted",
      created_at: "2026-02-17T14:00:00Z",
    },
    {
      id: "ms-003",
      company_id: "co-001",
      relationship_id: "rel-001",
      title: "Series B investor deck draft approved",
      description: "Develop and get Cradle sign-off on Series B fundraising deck incorporating distribution KPIs and Indonesia expansion narrative",
      target_date: "2026-06-30",
      quarter: "Q3 2026",
      status: "pending",
      source: "ai_drafted",
      created_at: "2026-02-17T14:00:00Z",
    },
    {
      id: "ms-004",
      company_id: "co-002",
      relationship_id: "rel-003",
      title: "CE Mark technical file submission",
      description: "Complete and submit CE Mark technical documentation package for HealthGuard vitals monitor to notified body",
      target_date: "2026-05-15",
      quarter: "Q2 2026",
      status: "at_risk",
      source: "ai_drafted",
      created_at: "2026-02-27T09:00:00Z",
    },
    {
      id: "ms-005",
      company_id: "co-002",
      relationship_id: "rel-003",
      title: "IHH pilot agreement signed (3 hospitals)",
      description: "Execute 12-month clinical validation pilot with IHH across Gleneagles KL, Pantai Cheras, and Pantai Klang",
      target_date: "2026-06-30",
      quarter: "Q2 2026",
      status: "on_track",
      source: "ai_drafted",
      created_at: "2026-02-27T09:00:00Z",
    },
    {
      id: "ms-006",
      company_id: "co-003",
      relationship_id: "rel-004",
      title: "MOE SmartSekolah programme MOU signed",
      description: "Secure formal MOU with KPM under the SmartSekolah initiative for 100-school pilot in Sabah/Sarawak expansion",
      target_date: "2026-05-31",
      quarter: "Q2 2026",
      status: "on_track",
      source: "ai_drafted",
      created_at: "2026-03-07T11:00:00Z",
    },
    {
      id: "ms-007",
      company_id: "co-003",
      relationship_id: "rel-004",
      title: "Secondary school content modules live (Math & Science)",
      description: "Launch Form 1-3 Math and Science adaptive content modules on the EduFlow platform, validated by MOE curriculum team",
      target_date: "2026-07-31",
      quarter: "Q3 2026",
      status: "pending",
      source: "ai_drafted",
      created_at: "2026-03-07T11:00:00Z",
    },
    {
      id: "ms-008",
      company_id: "co-004",
      relationship_id: "rel-005",
      title: "First 5 SME pilot contracts signed",
      description: "Close 5 paying pilot contracts with Malaysian manufacturers using ClimateSmart's IoT carbon monitoring system",
      target_date: "2026-06-30",
      quarter: "Q2 2026",
      status: "on_track",
      source: "ai_drafted",
      created_at: "2026-03-22T10:00:00Z",
    },
    {
      id: "ms-009",
      company_id: "co-004",
      relationship_id: "rel-005",
      title: "Verra VCS methodology submission",
      description: "Submit ClimateSmart's MRV protocol for Verra Verified Carbon Standard methodology approval",
      target_date: "2026-08-31",
      quarter: "Q3 2026",
      status: "pending",
      source: "ai_drafted",
      created_at: "2026-03-22T10:00:00Z",
    },
    // ── Historical milestone outcomes for the Closed engagements above ──
    {
      id: "ms-010",
      company_id: "co-001",
      relationship_id: "rel-006",
      title: "Indonesia go-to-market playbook delivered",
      description: "Complete market entry strategy, pricing model, and channel-partner shortlist for NutriTech's Indonesia expansion",
      target_date: "2025-08-31",
      quarter: "Q3 2025",
      status: "achieved",
      source: "ai_drafted",
      created_at: "2025-06-12T10:00:00Z",
    },
    {
      id: "ms-011",
      company_id: "co-001",
      relationship_id: "rel-006",
      title: "Enterprise pipeline of 10 qualified leads built",
      description: "Coach the founding team to build and qualify an enterprise sales pipeline of 10 B2B food manufacturers",
      target_date: "2025-10-31",
      quarter: "Q4 2025",
      status: "achieved",
      source: "ai_drafted",
      created_at: "2025-06-12T10:00:00Z",
    },
    {
      id: "ms-012",
      company_id: "co-001",
      relationship_id: "rel-007",
      title: "JAKIM halal certification roadmap approved",
      description: "Produce and validate a halal certification roadmap for NutriTech's functional ingredient line",
      target_date: "2025-09-30",
      quarter: "Q3 2025",
      status: "achieved",
      source: "ai_drafted",
      created_at: "2025-07-03T10:00:00Z",
    },
    {
      id: "ms-013",
      company_id: "co-001",
      relationship_id: "rel-007",
      title: "Functional ingredient reformulation validated",
      description: "Reformulate the core product to meet HACCP food-safety thresholds and pass lab validation",
      target_date: "2025-11-30",
      quarter: "Q4 2025",
      status: "at_risk",
      source: "ai_drafted",
      created_at: "2025-07-03T10:00:00Z",
    },
    {
      id: "ms-014",
      company_id: "co-002",
      relationship_id: "rel-008",
      title: "IHH clinical evidence dossier completed",
      description: "Assemble the clinical evidence package required for IHH hospital procurement evaluation",
      target_date: "2025-08-31",
      quarter: "Q3 2025",
      status: "achieved",
      source: "ai_drafted",
      created_at: "2025-05-17T10:00:00Z",
    },
    {
      id: "ms-015",
      company_id: "co-002",
      relationship_id: "rel-008",
      title: "Pantai Hospital procurement shortlisting secured",
      description: "Navigate the private-hospital procurement process to reach the vendor shortlist at Pantai Hospital KL",
      target_date: "2025-10-31",
      quarter: "Q4 2025",
      status: "achieved",
      source: "ai_drafted",
      created_at: "2025-05-17T10:00:00Z",
    },
    {
      id: "ms-016",
      company_id: "co-005",
      relationship_id: "rel-009",
      title: "BNM Digital Credit licensing application submitted",
      description: "Prepare and submit FinCore's licensing application under BNM's Digital Credit Market Framework",
      target_date: "2025-11-30",
      quarter: "Q4 2025",
      status: "achieved",
      source: "ai_drafted",
      created_at: "2025-08-22T10:00:00Z",
    },
    {
      id: "ms-017",
      company_id: "co-005",
      relationship_id: "rel-009",
      title: "Regulatory sandbox graduation review",
      description: "Complete the BNM sandbox graduation review with all compliance conditions cleared",
      target_date: "2026-01-31",
      quarter: "Q1 2026",
      status: "at_risk",
      source: "ai_drafted",
      created_at: "2025-08-22T10:00:00Z",
    },
    {
      id: "ms-018",
      company_id: "co-003",
      relationship_id: "rel-010",
      title: "First GLC procurement pilot signed",
      description: "Secure EduFlow's first signed procurement pilot with a government-linked entity through the Market Access programme",
      target_date: "2025-07-31",
      quarter: "Q3 2025",
      status: "achieved",
      source: "ai_drafted",
      created_at: "2025-04-12T10:00:00Z",
    },
    {
      id: "ms-019",
      company_id: "co-003",
      relationship_id: "rel-010",
      title: "Two ministry warm introductions converted",
      description: "Convert two programme-facilitated ministry introductions into active procurement conversations",
      target_date: "2025-09-30",
      quarter: "Q3 2025",
      status: "achieved",
      source: "ai_drafted",
      created_at: "2025-04-12T10:00:00Z",
    },
  ];

  const drafts: EmailDraft[] = [
    {
      id: "dr-001",
      relationship_id: "rel-001",
      type: "intro_email",
      subject: "Introduction: NutriTech ↔ Dato' Syed Amin | Cradle Programme",
      body: `Dear Dato' Syed Amin,

I hope this message finds you well. I'm writing from Cradle's programme team to introduce you to Aigerim Bekova, co-founder and CEO of NutriTech — one of our newest Series A portfolio companies.

NutriTech has built an AI-powered personalised nutrition engine that's gaining significant traction with B2B food manufacturers in Malaysia. Aigerim and her team are now at the stage where they need to accelerate distribution partnerships in Malaysia and execute a measured expansion into Indonesia — which is precisely where your track record at Aeon and in SEA retail distribution becomes invaluable.

We think there is a strong alignment between Dato' Syed Amin's deep FMCG distribution network and NutriTech's next 12-month priorities. Would you be open to a 15-minute introductory call with Aigerim at your convenience?

Warm regards,
Labubu | Cradle Programme Manager`,
      approved: true,
      sent_at: "2026-02-18T10:00:00Z",
    },
  ];

  return { companies, mentors, partners, programmes, relationships, milestones, drafts, candidates: [] };
}

function getStore(): Store {
  if (!globalThis.__cradleStore) {
    globalThis.__cradleStore = seedStore();
  }
  return globalThis.__cradleStore;
}

export function getCompanies() { return getStore().companies; }
export function getCompany(id: string) { return getStore().companies.find(c => c.id === id); }
export function getMentors() { return getStore().mentors; }
export function getMentor(id: string) { return getStore().mentors.find(m => m.id === id); }
export function getPartners() { return getStore().partners; }
export function getPartner(id: string) { return getStore().partners.find(p => p.id === id); }
export function getProgrammes() { return getStore().programmes; }
export function getProgramme(id: string) { return getStore().programmes.find(p => p.id === id); }
export function getRelationships() { return getStore().relationships; }
export function getRelationship(id: string) { return getStore().relationships.find(r => r.id === id); }
export function getMilestones() { return getStore().milestones; }
export function getDrafts() { return getStore().drafts; }
export function getCandidates(companyId: string) { return getStore().candidates.find(c => c.company_id === companyId); }

export function createCompany(data: Omit<Company, "id" | "created_at" | "created_by">): Company {
  const store = getStore();
  const company: Company = {
    ...data,
    id: `co-${String(store.companies.length + 1).padStart(3, "0")}`,
    created_at: new Date().toISOString(),
    created_by: "labubu@cradle.com.my",
  };
  store.companies.push(company);
  return company;
}

export function updateCompany(id: string, patch: Partial<Company>): Company | null {
  const store = getStore();
  const idx = store.companies.findIndex(c => c.id === id);
  if (idx < 0) return null;
  store.companies[idx] = { ...store.companies[idx], ...patch };
  return store.companies[idx];
}

export function saveCandidates(result: CandidatesResult) {
  const store = getStore();
  const idx = store.candidates.findIndex(c => c.company_id === result.company_id);
  if (idx >= 0) store.candidates[idx] = result;
  else store.candidates.push(result);
}

export function createRelationship(data: Omit<Relationship, "id" | "created_at">): Relationship {
  const store = getStore();
  const rel: Relationship = {
    ...data,
    id: `rel-${String(store.relationships.length + 1).padStart(3, "0")}`,
    created_at: new Date().toISOString(),
  };
  store.relationships.push(rel);
  return rel;
}

export function updateRelationship(id: string, patch: Partial<Relationship>): Relationship | null {
  const store = getStore();
  const idx = store.relationships.findIndex(r => r.id === id);
  if (idx < 0) return null;
  store.relationships[idx] = { ...store.relationships[idx], ...patch };
  return store.relationships[idx];
}

export function createMilestones(milestones: Omit<Milestone, "id" | "created_at">[]): Milestone[] {
  const store = getStore();
  const created = milestones.map((m, i) => ({
    ...m,
    id: `ms-${String(store.milestones.length + i + 1).padStart(3, "0")}`,
    created_at: new Date().toISOString(),
  }));
  store.milestones.push(...created);
  return created;
}

export function updateMilestone(id: string, patch: Partial<Milestone>): Milestone | null {
  const store = getStore();
  const idx = store.milestones.findIndex(m => m.id === id);
  if (idx < 0) return null;
  store.milestones[idx] = { ...store.milestones[idx], ...patch };
  return store.milestones[idx];
}

export function saveDraft(draft: Omit<EmailDraft, "id">): EmailDraft {
  const store = getStore();
  const created: EmailDraft = {
    ...draft,
    id: `dr-${String(store.drafts.length + 1).padStart(3, "0")}`,
  };
  store.drafts.push(created);
  return created;
}

export function updateDraft(id: string, patch: Partial<EmailDraft>): EmailDraft | null {
  const store = getStore();
  const idx = store.drafts.findIndex(d => d.id === id);
  if (idx < 0) return null;
  store.drafts[idx] = { ...store.drafts[idx], ...patch };
  return store.drafts[idx];
}
