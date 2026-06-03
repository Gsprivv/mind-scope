/** UK postcode district (outward code) for regional signposting. */
export function getPostcodeDistrict(postcode: string): string {
  const normalised = postcode.trim().toUpperCase().replace(/\s+/g, " ");
  const match = normalised.match(/^([A-Z]{1,2}\d[A-Z\d]?)/);
  return match ? match[1] : normalised.split(" ")[0] || "";
}

export interface DietitianService {
  name: string;
  detail: string;
  contact: string;
  href?: string;
}

export interface DietitianSignpost {
  areaLabel: string;
  intro: string;
  services: DietitianService[];
}

interface RegionHint {
  match: (district: string, city: string) => boolean;
  areaLabel: string;
  nhsLine?: DietitianService;
}

const REGIONS: RegionHint[] = [
  {
    match: (d, c) =>
      /^(E|EC|N|NW|SE|SW|W|WC)/.test(d) || /london/i.test(c),
    areaLabel: "Greater London",
    nhsLine: {
      name: "NHS London — weight & dietetics",
      detail: "Referral via your GP to local NHS dietetics or tiered weight-management services",
      contact: "Start with your GP surgery or NHS 111",
      href: "https://www.nhs.uk/nhs-services/find-services/",
    },
  },
  {
    match: (d, c) => /^M/.test(d) || /manchester|salford|trafford/i.test(c),
    areaLabel: "Greater Manchester",
    nhsLine: {
      name: "NHS Greater Manchester",
      detail: "GP referral to community dietetics and weight-management pathways",
      contact: "Contact your GP — NHS 111 for advice",
      href: "https://www.nhs.uk/nhs-services/find-services/",
    },
  },
  {
    match: (d, c) => /^B/.test(d) || /birmingham|solihull/i.test(c),
    areaLabel: "West Midlands (Birmingham area)",
    nhsLine: {
      name: "NHS Birmingham & Solihull",
      detail: "Dietitian access usually via GP referral",
      contact: "Book a GP appointment",
      href: "https://www.nhs.uk/nhs-services/find-services/",
    },
  },
  {
    match: (d, c) => /^L/.test(d) || /liverpool|wirral/i.test(c),
    areaLabel: "Merseyside",
    nhsLine: {
      name: "NHS Cheshire & Merseyside",
      detail: "Community dietetics via GP referral",
      contact: "Contact your GP surgery",
      href: "https://www.nhs.uk/nhs-services/find-services/",
    },
  },
  {
    match: (d, c) => /^G/.test(d) || /glasgow/i.test(c),
    areaLabel: "Scotland (Glasgow area)",
    nhsLine: {
      name: "NHS Scotland — dietetics",
      detail: "Speak to your GP for referral to NHS dietetics",
      contact: "NHS 24 — 111",
      href: "https://www.nhsinform.scot/",
    },
  },
  {
    match: (d, c) => /^CF|^NP|^SA/.test(d) || /cardiff|swansea|wales/i.test(c),
    areaLabel: "Wales",
    nhsLine: {
      name: "NHS Wales — dietetics",
      detail: "GP referral to community dietitian services",
      contact: "NHS 111 Wales",
      href: "https://www.nhsdirect.wales.nhs.uk/",
    },
  },
  {
    match: (d, c) => /^BT/.test(d) || /belfast|northern ireland/i.test(c),
    areaLabel: "Northern Ireland",
    nhsLine: {
      name: "HSCNI — dietetics",
      detail: "Ask your GP for referral to a dietitian",
      contact: "GP surgery or NI Direct",
      href: "https://www.nidirect.gov.uk/",
    },
  },
];

const BDA_FIND: DietitianService = {
  name: "British Dietetic Association — Find a dietitian",
  detail: "Search for a registered dietitian near your postcode (private or freelance)",
  contact: "Search on BDA website",
  href: "https://www.bda.uk.com/food-health/find-a-freelance-dietitian.html",
};

const NHS_FIND: DietitianService = {
  name: "NHS — Find services near you",
  detail: "GP practices, weight-management, and local NHS services",
  contact: "Enter your postcode on NHS.uk",
  href: "https://www.nhs.uk/nhs-services/find-services/",
};

const GP_REFERRAL: DietitianService = {
  name: "NHS dietitian (via your GP)",
  detail:
    "Most NHS dietitians require a GP referral. Mention your weight goals and any health conditions.",
  contact: "Book a GP appointment",
  href: "https://www.nhs.uk/nhs-services/gp-services/",
};

export function getDietitianSignpost(
  postcode: string,
  city: string
): DietitianSignpost {
  const district = getPostcodeDistrict(postcode);
  const cityNorm = city.trim();
  const region = REGIONS.find((r) => r.match(district, cityNorm));

  const areaLabel = region?.areaLabel ?? (cityNorm || "your area");
  const postcodeDisplay = postcode.trim().toUpperCase() || "your postcode";

  const services: DietitianService[] = [
    GP_REFERRAL,
    {
      ...NHS_FIND,
      detail: `${NHS_FIND.detail} — use postcode **${postcodeDisplay}**`,
    },
    BDA_FIND,
  ];

  if (region?.nhsLine) {
    services.unshift(region.nhsLine);
  }

  return {
    areaLabel,
    intro: `Based on **${postcodeDisplay}**${cityNorm ? ` (${cityNorm})` : ""}, here are trusted ways to find a **registered dietitian** in ${areaLabel}. Mind Scope cannot book appointments — your GP is the usual route for NHS care.`,
    services,
  };
}
