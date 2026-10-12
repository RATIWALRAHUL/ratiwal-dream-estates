import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Property } from "@/models/Property";
import { PlotOption } from "@/models/PlotOption";
import { Location } from "@/models/Location";
import { Lead } from "@/models/Lead";
import { SiteVisit } from "@/models/SiteVisit";
import { sqFtToSqYards } from "@/lib/utils/area";
import { formatPaiseToRupeeString, paiseToRupees } from "@/lib/utils/currency";
import { normalizePhone, normalizeEmail } from "@/lib/utils/phone";
import { generateReferenceNumber } from "@/lib/utils/reference";
import { logger } from "@/lib/logger";
import { createHash } from "crypto";
import type { ChatCompletionTool } from "openai/resources/chat/completions";

// ─── 1. OpenAI Tool Specifications ────────────────────────────────────────────

export const CHATBOT_TOOLS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_projects",
      description:
        "Searches published townships and property developments in the DreamEstate database based on verified location, city, budget, plot size, or property type.",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "City name, e.g., 'Jaipur', 'Navi Mumbai', 'Ajmer'.",
          },
          locality: {
            type: "string",
            description: "Locality or corridor name, e.g., 'Chaksu', 'Vatika', 'Sikar Road'.",
          },
          propertyType: {
            type: "string",
            enum: ["RESIDENTIAL_PLOT", "COMMERCIAL_PLOT", "VILLA", "MIXED_USE"],
            description: "Type of development.",
          },
          minBudgetRupees: {
            type: "number",
            description: "Minimum budget in Indian Rupees (INR).",
          },
          maxBudgetRupees: {
            type: "number",
            description: "Maximum budget in Indian Rupees (INR).",
          },
          minPlotSizeSqYd: {
            type: "number",
            description: "Minimum plot area in Square Yards (Gaj).",
          },
          maxPlotSizeSqYd: {
            type: "number",
            description: "Maximum plot area in Square Yards (Gaj).",
          },
          amenity: {
            type: "string",
            description: "Specific amenity desired, e.g., 'Park', 'Clubhouse', 'Gated Security'.",
          },
          limit: {
            type: "number",
            description: "Maximum number of projects to return (1-10). Defaults to 6.",
          },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_project_details",
      description:
        "Retrieves verified database specifications for a specific project/township by slug, name, or ID, including RERA registration, masterplan, brochure, approvals, connectivity, and development status.",
      parameters: {
        type: "object",
        properties: {
          identifier: {
            type: "string",
            description: "Project slug, title, or ID (e.g., 'neelkanth-nagar' or 'Neelkanth Nagar').",
          },
        },
        required: ["identifier"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "compare_projects",
      description:
        "Compares 2 to 4 projects side-by-side using actual database records, highlighting locality, plot sizes, verified pricing, RERA status, and key amenities. Clearly labels any missing or unrecorded fields.",
      parameters: {
        type: "object",
        properties: {
          projectIdentifiers: {
            type: "array",
            items: { type: "string" },
            description: "List of 2 to 4 project names, slugs, or IDs to compare.",
          },
        },
        required: ["projectIdentifiers"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_project_amenities",
      description:
        "Fetches the authentic list of amenities officially recorded in the database for a specific project. Does not invent unrecorded amenities.",
      parameters: {
        type: "object",
        properties: {
          identifier: {
            type: "string",
            description: "Project slug, title, or ID.",
          },
        },
        required: ["identifier"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_project_media",
      description:
        "Retrieves verified ImageKit photographs, master plan preview URLs, and brochures for a project.",
      parameters: {
        type: "object",
        properties: {
          identifier: {
            type: "string",
            description: "Project slug or title.",
          },
        },
        required: ["identifier"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_project_availability",
      description:
        "Queries live inventory and demarcated plot options recorded in the database for a project, including dimensions, facing, and corner status.",
      parameters: {
        type: "object",
        properties: {
          identifier: {
            type: "string",
            description: "Project slug, title, or ID.",
          },
        },
        required: ["identifier"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_project_pricing",
      description:
        "Returns verified pricing details for a project. If pricing is unrecorded or marked ON_REQUEST, explicitly reports 'Price on Request'.",
      parameters: {
        type: "object",
        properties: {
          identifier: {
            type: "string",
            description: "Project slug or title.",
          },
        },
        required: ["identifier"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_lead",
      description:
        "Creates an official property enquiry in the CRM / Admin Dashboard after the user has explicitly provided their contact details and given consent to be contacted.",
      parameters: {
        type: "object",
        properties: {
          fullName: {
            type: "string",
            description: "Visitor's full name.",
          },
          phone: {
            type: "string",
            description: "10-digit Indian phone number or international number.",
          },
          email: {
            type: "string",
            description: "Visitor's email address (optional).",
          },
          preferredProjectIdentifier: {
            type: "string",
            description: "Name or slug of the project they are inquiring about (optional).",
          },
          preferredLocation: {
            type: "string",
            description: "Preferred area or city (optional).",
          },
          budgetRange: {
            type: "string",
            description: "Visitor's approximate budget range (optional).",
          },
          preferredPlotSize: {
            type: "string",
            description: "Preferred plot size in Sq. Yards / Gaj (optional).",
          },
          message: {
            type: "string",
            description: "Specific question or note from the conversation.",
          },
          userConsent: {
            type: "boolean",
            description: "Must be true confirming the visitor agreed to receive a callback or WhatsApp from Ratiwal Dream Estates advisors.",
          },
        },
        required: ["fullName", "phone", "userConsent"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "request_site_visit",
      description:
        "Schedules or records a site visit request for a project after the visitor gives consent, selecting a preferred date and time slot.",
      parameters: {
        type: "object",
        properties: {
          fullName: {
            type: "string",
            description: "Visitor's full name.",
          },
          phone: {
            type: "string",
            description: "Visitor's phone number.",
          },
          projectIdentifier: {
            type: "string",
            description: "Name or slug of the project to visit.",
          },
          preferredDate: {
            type: "string",
            description: "Requested date for site visit in YYYY-MM-DD format (or upcoming day).",
          },
          preferredTimeSlot: {
            type: "string",
            description: "Preferred time slot, e.g., '10:00 AM Morning', '02:00 PM Afternoon', '04:30 PM Evening'.",
          },
          visitorCount: {
            type: "number",
            description: "Estimated number of visitors attending (default: 1).",
          },
          meetingPoint: {
            type: "string",
            description: "Requested pickup or meeting point, e.g., 'Site Office' or 'Jaipur Railway Station' (optional).",
          },
          userConsent: {
            type: "boolean",
            description: "Must be true confirming the visitor agreed to be contacted to confirm the visit schedule.",
          },
        },
        required: ["fullName", "phone", "projectIdentifier", "preferredDate", "userConsent"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_project_plot_sizes",
      description:
        "Retrieves verified plot size options and commercial unit types recorded in the database for a specific project. Accurately reports sizes in both Square Yards (Gaj) and Square Feet, distinguishing advertised project ranges from demarcated inventory options, and distinguishing commercial units (shops/offices) from residential plots.",
      parameters: {
        type: "object",
        properties: {
          identifier: {
            type: "string",
            description: "Project title, slug, or ID (e.g., 'neelkanth-nagar', 'Happy Business Park', 'One Kishangarh', 'Balaji Puram').",
          },
        },
        required: ["identifier"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_inventory_by_size",
      description:
        "Searches live plot options and commercial units across all published projects matching exact or ranged size criteria in Square Yards or Square Feet. Returns matching project names, locations, and specific available plot/unit records from the database.",
      parameters: {
        type: "object",
        properties: {
          minPlotSizeSqYd: {
            type: "number",
            description: "Minimum plot size in Square Yards (Gaj).",
          },
          maxPlotSizeSqYd: {
            type: "number",
            description: "Maximum plot size in Square Yards (Gaj).",
          },
          exactPlotSizeSqYd: {
            type: "number",
            description: "Exact plot size in Square Yards (e.g. 200, 150, 111, 88, 106, 450).",
          },
          city: {
            type: "string",
            description: "City filter, e.g. 'Jaipur', 'Ajmer', 'Kishangarh'.",
          },
          propertyType: {
            type: "string",
            enum: ["RESIDENTIAL_PLOT", "COMMERCIAL_PLOT"],
            description: "Filter by development type.",
          },
          limit: {
            type: "number",
            description: "Max results to return (default 15).",
          },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_unit_availability",
      description:
        "Provides accurate unit availability breakdown for a project based on live inventory records. Distinguishes available, booked/sold, and unverified inventory. Explicitly reports when a size option exists but availability must be confirmed by sales advisors.",
      parameters: {
        type: "object",
        properties: {
          identifier: {
            type: "string",
            description: "Project title or slug.",
          },
          plotNumber: {
            type: "string",
            description: "Specific plot or unit number (optional).",
          },
          sizeSqYd: {
            type: "number",
            description: "Specific size in Sq. Yards (optional).",
          },
        },
        required: ["identifier"],
        additionalProperties: false,
      },
    },
  },
];

// ─── 2. Helper Resolvers ──────────────────────────────────────────────────────

async function findPropertyByIdentifier(identifier: string) {
  await connectToDatabase();
  const trimmed = identifier.trim();

  // Try exact slug
  let prop = await Property.findOne({
    slug: trimmed.toLowerCase(),
    publicationStatus: "PUBLISHED",
  })
    .populate("locationId", "name city state slug coordinates")
    .lean();

  if (prop) return prop;

  // Try MongoDB ObjectId
  if (Types.ObjectId.isValid(trimmed)) {
    prop = await Property.findOne({
      _id: new Types.ObjectId(trimmed),
      publicationStatus: "PUBLISHED",
    })
      .populate("locationId", "name city state slug coordinates")
      .lean();
    if (prop) return prop;
  }

  // Case-insensitive title regex lookup
  const safeRegex = new RegExp(trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  prop = await Property.findOne({
    title: safeRegex,
    publicationStatus: "PUBLISHED",
  })
    .populate("locationId", "name city state slug coordinates")
    .lean();

  return prop;
}

// ─── 3. Tool Implementations ──────────────────────────────────────────────────

export async function executeSearchProjects(args: {
  city?: string;
  locality?: string;
  propertyType?: string;
  minBudgetRupees?: number;
  maxBudgetRupees?: number;
  minPlotSizeSqYd?: number;
  maxPlotSizeSqYd?: number;
  amenity?: string;
  limit?: number;
}) {
  await connectToDatabase();
  const filter: Record<string, any> = { publicationStatus: "PUBLISHED" };

  if (args.propertyType) {
    filter.propertyType = args.propertyType;
  }

  if (args.locality) {
    const locRegex = new RegExp(args.locality.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.locality = locRegex;
  }

  if (args.minBudgetRupees || args.maxBudgetRupees) {
    const pricingFilter: Record<string, any> = {};
    if (args.minBudgetRupees) {
      pricingFilter.$gte = args.minBudgetRupees * 100; // convert to paise
    }
    if (args.maxBudgetRupees) {
      pricingFilter.$lte = args.maxBudgetRupees * 100;
    }
    filter["pricing.startingPricePaise"] = pricingFilter;
  }

  if (args.minPlotSizeSqYd || args.maxPlotSizeSqYd) {
    // 1 Sq Yard = 9 Sq Ft
    if (args.minPlotSizeSqYd) {
      filter["area.maximumAreaSqFt"] = { $gte: args.minPlotSizeSqYd * 9 };
    }
    if (args.maxPlotSizeSqYd) {
      filter["area.minimumAreaSqFt"] = {
        ...(filter["area.minimumAreaSqFt"] || {}),
        $lte: args.maxPlotSizeSqYd * 9,
      };
    }
  }

  if (args.amenity) {
    const amenRegex = new RegExp(args.amenity.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter["amenities.name"] = amenRegex;
  }

  // Pre-filter by locationId if city is specified to avoid truncation by limit
  if (args.city) {
    const cityNorm = args.city.trim().toLowerCase();
    const matchingLocations = await Location.find({
      $or: [
        { city: new RegExp(cityNorm, "i") },
        { name: new RegExp(cityNorm, "i") },
        { slug: new RegExp(cityNorm, "i") },
      ],
    }).select("_id").lean();

    const locIds = matchingLocations.map((l: any) => l._id);
    filter.$or = [
      { locationId: { $in: locIds } },
      { locality: new RegExp(cityNorm, "i") },
      { address: new RegExp(cityNorm, "i") },
    ];
  }

  const limit = Math.min(Math.max(Number(args.limit) || 6, 1), 10);

  const docs = await Property.find(filter)
    .populate("locationId", "name city state slug coordinates")
    .select("title slug shortDescription propertyType listingStatus locality locationId pricing area media highlights rera sortOrder createdAt")
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(limit)
    .lean();

  let filteredDocs = docs;

  const results = filteredDocs.map((doc: any) => {
    const loc = doc.locationId as any;
    const minSqYd = sqFtToSqYards(doc.area?.minimumAreaSqFt || 0);
    const maxSqYd = sqFtToSqYards(doc.area?.maximumAreaSqFt || 0);
    const sizeRange = minSqYd === maxSqYd ? `${minSqYd} Sq. Yds` : `${minSqYd} – ${maxSqYd} Sq. Yds`;

    const sortedMedia = (doc.media || [])
      .filter((m: any) => m.publicationStatus === "ACTIVE")
      .sort((a: any, b: any) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0) || a.sortOrder - b.sortOrder);
    const primaryImage = sortedMedia[0]?.url || null;

    const priceLabel =
      doc.pricing?.priceVisibility === "PUBLIC" && doc.pricing?.startingPricePaise
        ? `${formatPaiseToRupeeString(doc.pricing.startingPricePaise)} Onwards`
        : "Price on Request";

    return {
      id: doc._id.toString(),
      title: doc.title,
      slug: doc.slug,
      locality: doc.locality || loc?.name || "Verified Corridor",
      city: loc?.city || "Jaipur",
      propertyType: doc.propertyType,
      sizeRange,
      minAreaSqYd: minSqYd,
      maxAreaSqYd: maxSqYd,
      priceLabel,
      startingPriceRupees: doc.pricing?.startingPricePaise ? paiseToRupees(doc.pricing.startingPricePaise) : null,
      primaryImageUrl: primaryImage,
      reraNumber: doc.rera?.registrationNumber || null,
      reraStatus: doc.rera?.status || "NOT_APPLICABLE",
      highlights: (doc.highlights || []).slice(0, 3),
      url: `/properties/${doc.slug}`,
    };
  });

  return {
    totalFound: results.length,
    filtersApplied: {
      city: args.city || null,
      locality: args.locality || null,
      propertyType: args.propertyType || null,
      budgetRange: args.minBudgetRupees || args.maxBudgetRupees ? `${args.minBudgetRupees || 0} - ${args.maxBudgetRupees || 'Any'}` : null,
      plotSizeRangeSqYd: args.minPlotSizeSqYd || args.maxPlotSizeSqYd ? `${args.minPlotSizeSqYd || 0} - ${args.maxPlotSizeSqYd || 'Any'}` : null,
    },
    projects: results,
  };
}

export async function executeGetProjectDetails(args: { identifier: string }) {
  const doc: any = await findPropertyByIdentifier(args.identifier);

  if (!doc) {
    return {
      found: false,
      message: `No published project found matching "${args.identifier}" in the database.`,
      availableProjectsSuggestionPrompt: "Would you like me to show all current verified projects in Jaipur?",
    };
  }

  const loc = doc.locationId as any;
  const minSqYd = sqFtToSqYards(doc.area?.minimumAreaSqFt || 0);
  const maxSqYd = sqFtToSqYards(doc.area?.maximumAreaSqFt || 0);

  // Fetch PlotOptions if available
  const plotDocs = await PlotOption.find({ propertyId: doc._id, publiclyVisible: true }).lean();
  const availablePlots = plotDocs.map((p: any) => ({
    plotNumber: p.plotNumber || p.label,
    areaSqYd: sqFtToSqYards(p.areaSqFt),
    facing: p.facing || "North",
    isCorner: Boolean(p.cornerPlot),
    status: p.status,
    price: p.basePricePaise ? formatPaiseToRupeeString(p.basePricePaise) : "Price on Request",
  }));

  const activeMedia = (doc.media || [])
    .filter((m: any) => m.publicationStatus === "ACTIVE")
    .sort((a: any, b: any) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0) || a.sortOrder - b.sortOrder);

  return {
    found: true,
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    shortDescription: doc.shortDescription,
    fullDescription: doc.fullDescription,
    propertyType: doc.propertyType,
    listingStatus: doc.listingStatus,
    locality: doc.locality || loc?.name,
    address: doc.address || null,
    city: loc?.city || "Jaipur",
    state: loc?.state || "Rajasthan",
    pricing: {
      visibility: doc.pricing?.priceVisibility || "ON_REQUEST",
      startingPrice: doc.pricing?.startingPricePaise
        ? `${formatPaiseToRupeeString(doc.pricing.startingPricePaise)} Onwards`
        : "Price on Request",
      pricePerSqYd: doc.pricing?.pricePerSqFtPaise
        ? formatPaiseToRupeeString(doc.pricing.pricePerSqFtPaise * 9)
        : null,
    },
    area: {
      minPlotSizeSqYd: minSqYd,
      maxPlotSizeSqYd: maxSqYd,
      displayRange: minSqYd === maxSqYd ? `${minSqYd} Sq. Yds` : `${minSqYd} to ${maxSqYd} Sq. Yds`,
    },
    plotOptionsCount: availablePlots.length,
    plotOptions: availablePlots.slice(0, 8),
    rera: {
      applicable: Boolean(doc.rera?.applicable),
      registrationNumber: doc.rera?.registrationNumber || "Exempt / Pre-RERA",
      authorityName: doc.rera?.authorityName || "RERA Rajasthan",
      status: doc.rera?.status || "NOT_APPLICABLE",
    },
    amenities: (doc.amenities || []).map((a: any) => ({
      name: a.name,
      category: a.category,
      status: a.status,
    })),
    highlights: doc.highlights || [],
    connectivity: (doc.connectivityMilestones || []).map((c: any) => ({
      destination: c.destination,
      travelTime: c.approxTravelTime,
      route: c.route,
    })),
    infrastructure: (doc.infrastructureMilestones || []).map((i: any) => ({
      name: i.name,
      description: i.description,
    })),
    possessionTimeline: doc.possessionOrDevelopmentStatus || "Immediate Demarcation / Ready for Possession",
    masterplanAvailable: Boolean(doc.masterplan?.fileUrl || doc.masterplan?.imageUrl),
    masterplanPreviewUrl: doc.masterplan?.imageUrl || null,
    brochureAvailable: Boolean(doc.brochure?.fileUrl),
    mediaGallery: activeMedia.map((m: any) => ({
      url: m.url,
      caption: m.caption || doc.title,
      altText: m.altText || doc.title,
      isPrimary: Boolean(m.isPrimary),
    })),
    url: `/properties/${doc.slug}`,
  };
}

export async function executeCompareProjects(args: { projectIdentifiers: string[] }) {
  if (!args.projectIdentifiers || args.projectIdentifiers.length < 2) {
    return {
      error: "Please provide at least 2 projects to compare.",
    };
  }

  const projectsToCompare = [];
  for (const id of args.projectIdentifiers.slice(0, 4)) {
    const details = await executeGetProjectDetails({ identifier: id });
    if (details.found) {
      projectsToCompare.push(details);
    }
  }

  if (projectsToCompare.length < 2) {
    return {
      error: `Could only resolve ${projectsToCompare.length} valid project from database. Need at least 2.`,
      resolved: projectsToCompare.map((p: any) => p.title),
    };
  }

  const comparisonTable = projectsToCompare.map((p: any) => ({
    title: p.title,
    slug: p.slug,
    locality: p.locality,
    city: p.city,
    plotSizes: p.area.displayRange,
    pricing: p.pricing.startingPrice,
    rera: p.rera.registrationNumber,
    possession: p.possessionTimeline,
    amenitiesCount: p.amenities.length,
    topAmenities: p.amenities.slice(0, 4).map((a: any) => a.name),
    url: p.url,
  }));

  return {
    comparisonCount: projectsToCompare.length,
    comparison: comparisonTable,
  };
}

export async function executeGetProjectAmenities(args: { identifier: string }) {
  const doc: any = await findPropertyByIdentifier(args.identifier);
  if (!doc) {
    return { found: false, message: `Project "${args.identifier}" not found.` };
  }

  return {
    found: true,
    projectTitle: doc.title,
    amenities: (doc.amenities || []).map((a: any) => ({
      name: a.name,
      category: a.category || "General",
      status: a.status || "Available",
    })),
    totalCount: (doc.amenities || []).length,
  };
}

export async function executeGetProjectMedia(args: { identifier: string }) {
  const doc: any = await findPropertyByIdentifier(args.identifier);
  if (!doc) {
    return { found: false, message: `Project "${args.identifier}" not found.` };
  }

  const activeMedia = (doc.media || [])
    .filter((m: any) => m.publicationStatus === "ACTIVE")
    .sort((a: any, b: any) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0) || a.sortOrder - b.sortOrder);

  return {
    found: true,
    projectTitle: doc.title,
    mediaItems: activeMedia.map((m: any) => ({
      url: m.url,
      caption: m.caption || doc.title,
      altText: m.altText || doc.title,
      isPrimary: Boolean(m.isPrimary),
    })),
    masterplanPreviewUrl: doc.masterplan?.imageUrl || null,
    brochureUrl: doc.brochure?.fileUrl || null,
  };
}

export async function executeGetProjectAvailability(args: { identifier: string }) {
  const doc: any = await findPropertyByIdentifier(args.identifier);
  if (!doc) {
    return { found: false, message: `Project "${args.identifier}" not found.` };
  }

  const plotDocs = await PlotOption.find({ propertyId: doc._id, publiclyVisible: true }).lean();

  return {
    found: true,
    projectTitle: doc.title,
    totalDemarcatedPlots: plotDocs.length,
    plots: plotDocs.map((p: any) => ({
      plotNumber: p.plotNumber || p.label,
      areaSqYd: sqFtToSqYards(p.areaSqFt),
      widthFt: p.widthFeet || null,
      lengthFt: p.lengthFeet || null,
      facing: p.facing || "North",
      cornerPlot: Boolean(p.cornerPlot),
      status: p.status,
      price: p.basePricePaise ? formatPaiseToRupeeString(p.basePricePaise) : "Price on Request",
    })),
  };
}

export async function executeGetProjectPricing(args: { identifier: string }) {
  const doc: any = await findPropertyByIdentifier(args.identifier);
  if (!doc) {
    return { found: false, message: `Project "${args.identifier}" not found.` };
  }

  const priceVisibility = doc.pricing?.priceVisibility || "ON_REQUEST";
  const startingPaise = doc.pricing?.startingPricePaise;

  return {
    found: true,
    projectTitle: doc.title,
    priceVisibility,
    startingPriceLabel:
      priceVisibility === "PUBLIC" && startingPaise
        ? `${formatPaiseToRupeeString(startingPaise)} Onwards`
        : "Price on Request",
    pricePerSqYd:
      doc.pricing?.pricePerSqFtPaise
        ? formatPaiseToRupeeString(doc.pricing.pricePerSqFtPaise * 9)
        : null,
    advisoryNote:
      "All property rates at Ratiwal Dream Estates are direct registry-ready pricing with transparent documentation.",
  };
}

export async function executeGetProjectPlotSizes(args: { identifier: string }) {
  const doc: any = await findPropertyByIdentifier(args.identifier);
  if (!doc) {
    return {
      found: false,
      message: `Project "${args.identifier}" was not found in the verified database.`,
    };
  }

  const plotDocs = await PlotOption.find({
    propertyId: doc._id,
    publiclyVisible: true,
  })
    .sort({ sortOrder: 1, plotNumber: 1 })
    .lean();

  const isCommercial = doc.inventoryMode === "COMMERCIAL_INVENTORY" || doc.propertyType === "COMMERCIAL_PLOT";
  const minSqYd = sqFtToSqYards(doc.area?.minimumAreaSqFt || 0);
  const maxSqYd = sqFtToSqYards(doc.area?.maximumAreaSqFt || 0);

  const distinctSizesSqYd = Array.from(new Set(plotDocs.map((p: any) => sqFtToSqYards(p.areaSqFt))));
  const distinctSizesSqFt = Array.from(new Set(plotDocs.map((p: any) => p.areaSqFt)));

  return {
    found: true,
    projectTitle: doc.title,
    slug: doc.slug,
    locality: doc.locality,
    city: (doc.locationId as any)?.city || "Jaipur",
    propertyType: doc.propertyType,
    inventoryMode: doc.inventoryMode,
    isCommercial,
    advertisedRange: {
      advertisedStartingSizeSqYd: minSqYd,
      advertisedMaxRangeSqYd: maxSqYd,
      advertisedStartingSizeSqFt: doc.area?.minimumAreaSqFt,
      advertisedMaxRangeSqFt: doc.area?.maximumAreaSqFt,
      advertisedDisplayRange: `${minSqYd} – ${maxSqYd} Sq. Yards (${doc.area?.minimumAreaSqFt} – ${doc.area?.maximumAreaSqFt} Sq. Ft)`,
      note: "Advertised range represents planning limits; individual available sizes are recorded below in active inventory.",
    },
    recordedInventoryCount: plotDocs.length,
    recordedSizesSummary: {
      sizesInSquareYards: distinctSizesSqYd,
      sizesInSquareFeet: distinctSizesSqFt,
      formattedListing: distinctSizesSqYd.map((yd, idx) => `${yd} Sq. Yds (${distinctSizesSqFt[idx]} Sq. Ft)`),
    },
    inventoryUnits: plotDocs.map((p: any) => ({
      plotNumber: p.plotNumber || p.label,
      label: p.label,
      areaSqYd: sqFtToSqYards(p.areaSqFt),
      areaSqFt: p.areaSqFt,
      unitType: isCommercial
        ? p.label?.toLowerCase().includes("shop")
          ? "Retail Commercial Shop"
          : p.label?.toLowerCase().includes("office")
          ? "Corporate Office Space"
          : "Commercial Unit"
        : "Residential Plot",
      facing: p.facing || "North",
      cornerPlot: Boolean(p.cornerPlot),
      status: p.status,
      price: p.basePricePaise ? formatPaiseToRupeeString(p.basePricePaise) : "Price on Request",
      verified: true,
    })),
  };
}

export async function executeSearchInventoryBySize(args: {
  minPlotSizeSqYd?: number;
  maxPlotSizeSqYd?: number;
  exactPlotSizeSqYd?: number;
  city?: string;
  propertyType?: string;
  limit?: number;
}) {
  await connectToDatabase();

  const propFilter: Record<string, any> = { publicationStatus: "PUBLISHED" };
  if (args.propertyType) propFilter.propertyType = args.propertyType;

  const properties = await Property.find(propFilter)
    .populate("locationId", "name city state slug")
    .lean();

  let filteredProps = properties;
  if (args.city) {
    const cNorm = args.city.trim().toLowerCase();
    filteredProps = properties.filter((p: any) => {
      const loc = p.locationId as any;
      return (
        loc?.city?.toLowerCase().includes(cNorm) ||
        loc?.name?.toLowerCase().includes(cNorm) ||
        loc?.slug?.toLowerCase().includes(cNorm) ||
        p.locality?.toLowerCase().includes(cNorm) ||
        p.address?.toLowerCase().includes(cNorm)
      );
    });
  }

  const propIds = filteredProps.map((p: any) => p._id);

  const plotFilter: Record<string, any> = {
    propertyId: { $in: propIds },
    publiclyVisible: true,
  };

  if (args.exactPlotSizeSqYd) {
    const targetSqFt = args.exactPlotSizeSqYd * 9;
    plotFilter.areaSqFt = { $gte: targetSqFt - 10, $lte: targetSqFt + 10 };
  } else {
    if (args.minPlotSizeSqYd) {
      plotFilter.areaSqFt = { ...(plotFilter.areaSqFt || {}), $gte: args.minPlotSizeSqYd * 9 - 10 };
    }
    if (args.maxPlotSizeSqYd) {
      plotFilter.areaSqFt = { ...(plotFilter.areaSqFt || {}), $lte: args.maxPlotSizeSqYd * 9 + 10 };
    }
  }

  const plots = await PlotOption.find(plotFilter)
    .populate("propertyId", "title slug locality propertyType inventoryMode")
    .limit(args.limit || 15)
    .lean();

  const propMap = new Map<string, any>();
  for (const p of filteredProps) {
    propMap.set(p._id.toString(), p);
  }

  const matchingUnits = plots.map((pl: any) => {
    const parentProp = propMap.get(pl.propertyId?._id?.toString() || pl.propertyId?.toString());
    const loc = parentProp?.locationId as any;
    return {
      projectTitle: parentProp?.title || "Verified Project",
      slug: parentProp?.slug,
      city: loc?.city || "Jaipur",
      locality: parentProp?.locality,
      propertyType: parentProp?.propertyType,
      plotNumber: pl.plotNumber,
      label: pl.label,
      areaSqYd: sqFtToSqYards(pl.areaSqFt),
      areaSqFt: pl.areaSqFt,
      facing: pl.facing,
      cornerPlot: Boolean(pl.cornerPlot),
      status: pl.status,
      price: pl.basePricePaise ? formatPaiseToRupeeString(pl.basePricePaise) : "Price on Request",
      url: `/properties/${parentProp?.slug}`,
    };
  });

  return {
    totalMatchingUnits: matchingUnits.length,
    matchingUnits,
  };
}

export async function executeGetUnitAvailability(args: {
  identifier: string;
  plotNumber?: string;
  sizeSqYd?: number;
}) {
  const doc: any = await findPropertyByIdentifier(args.identifier);
  if (!doc) {
    return { found: false, message: `Project "${args.identifier}" not found in database.` };
  }

  const query: Record<string, any> = { propertyId: doc._id, publiclyVisible: true };
  if (args.plotNumber) {
    query.plotNumber = new RegExp(args.plotNumber.trim(), "i");
  }
  if (args.sizeSqYd) {
    const targetSqFt = args.sizeSqYd * 9;
    query.areaSqFt = { $gte: targetSqFt - 10, $lte: targetSqFt + 10 };
  }

  const plots = await PlotOption.find(query).sort({ sortOrder: 1 }).lean();

  const availableCount = plots.filter((p: any) => p.status === "AVAILABLE").length;
  const reservedCount = plots.filter((p: any) => p.status === "RESERVED").length;
  const soldCount = plots.filter((p: any) => p.status === "SOLD").length;

  return {
    found: true,
    projectTitle: doc.title,
    slug: doc.slug,
    totalQueriedUnits: plots.length,
    availabilitySummary: {
      availableUnits: availableCount,
      reservedUnits: reservedCount,
      soldUnits: soldCount,
    },
    units: plots.map((p: any) => ({
      plotNumber: p.plotNumber || p.label,
      label: p.label,
      areaSqYd: sqFtToSqYards(p.areaSqFt),
      areaSqFt: p.areaSqFt,
      status: p.status,
      facing: p.facing,
      price: p.basePricePaise ? formatPaiseToRupeeString(p.basePricePaise) : "Price on Request",
      confirmationNote:
        p.status === "AVAILABLE"
          ? "Demarcated in database as Available; sales verification advised for booking."
          : "Reserved or Sold.",
    })),
  };
}

export async function executeCreateLead(args: {
  fullName: string;
  phone: string;
  email?: string;
  preferredProjectIdentifier?: string;
  preferredLocation?: string;
  budgetRange?: string;
  preferredPlotSize?: string;
  message?: string;
  userConsent: boolean;
}) {
  if (!args.userConsent) {
    return {
      success: false,
      error: "User consent is required before saving contact details in accordance with data protection rules.",
    };
  }

  const phoneResult = normalizePhone(args.phone);
  if (!phoneResult) {
    return {
      success: false,
      error: "Please provide a valid 10-digit mobile number.",
    };
  }
  const normalizedPhone = phoneResult.e164;
  const displayPhone = phoneResult.display;

  await connectToDatabase();

  let propertyRef = null;
  if (args.preferredProjectIdentifier) {
    propertyRef = await findPropertyByIdentifier(args.preferredProjectIdentifier);
  }

  // Duplicate protection window (10 minutes)
  const salt = process.env.LEAD_FINGERPRINT_SALT || "ratiwal-lead-salt-change-in-prod";
  const fingerprint = createHash("sha256")
    .update(`${salt}:${normalizedPhone}|${propertyRef?._id?.toString() || ""}`)
    .digest("hex")
    .slice(0, 32);

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const existingRecentLead = await Lead.findOne({
    normalizedPhone,
    createdAt: { $gte: tenMinutesAgo },
  });

  if (existingRecentLead) {
    return {
      success: true,
      isDuplicate: true,
      referenceNumber: existingRecentLead.referenceNumber,
      message: `We already have your inquiry on file (Reference: ${existingRecentLead.referenceNumber}). Our property advisor Suresh Ratiwal will contact you shortly.`,
    };
  }

  const referenceNumber = generateReferenceNumber();

  const newLead = new Lead({
    referenceNumber,
    fullName: args.fullName.trim(),
    normalizedPhone,
    displayPhone,
    displayEmail: args.email?.trim() || undefined,
    normalizedEmail: args.email ? normalizeEmail(args.email) : undefined,
    preferredContactMethod: "PHONE",
    source: "OTHER",
    utmSource: "AI_CHATBOT",
    propertyId: propertyRef?._id || undefined,
    locationId: propertyRef?.locationId?._id || propertyRef?.locationId || undefined,
    preferredLocation: args.preferredLocation?.trim() || undefined,
    budgetRange: args.budgetRange?.trim() || undefined,
    message: args.message?.trim() || "Inquiry initiated via AI Assistant",
    status: "NEW",
    priority: "NORMAL",
    submissionFingerprint: fingerprint,
    consentGranted: true,
    consentTimestamp: new Date(),
    consentSource: "AI_CHATBOT",
    consentPurpose: "PROPERTY_ENQUIRY",
    consentTextVersion: "1.0",
    privacyPolicyVersion: "1.0",
    retentionReviewAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    timeline: [
      {
        eventType: "INQUIRY_SUBMITTED",
        actorType: "SYSTEM",
        summary: "Inquiry generated via DreamEstate AI Chatbot.",
        occurredAt: new Date(),
      },
    ],
  });

  await newLead.save();

  logger.info("Chatbot lead created successfully", {
    referenceNumber,
    project: propertyRef?.title,
    category: "CHATBOT",
  });

  return {
    success: true,
    referenceNumber,
    message: `Thank you, ${args.fullName}! Your inquiry has been registered with reference ID ${referenceNumber}. Advisor Suresh Ratiwal will connect with you with complete property details.`,
  };
}

export async function executeRequestSiteVisit(args: {
  fullName: string;
  phone: string;
  projectIdentifier: string;
  preferredDate: string;
  preferredTimeSlot?: string;
  visitorCount?: number;
  meetingPoint?: string;
  userConsent: boolean;
}) {
  if (!args.userConsent) {
    return {
      success: false,
      error: "User consent is required to register a site visit booking.",
    };
  }

  const phoneResult = normalizePhone(args.phone);
  if (!phoneResult) {
    return {
      success: false,
      error: "Please provide a valid 10-digit mobile number.",
    };
  }
  const normalizedPhone = phoneResult.e164;
  const displayPhone = phoneResult.display;

  await connectToDatabase();

  const propertyRef: any = await findPropertyByIdentifier(args.projectIdentifier);
  if (!propertyRef) {
    return {
      success: false,
      error: `Could not locate project "${args.projectIdentifier}" in database to schedule a site visit.`,
    };
  }

  const salt = process.env.LEAD_FINGERPRINT_SALT || "ratiwal-lead-salt-change-in-prod";
  const fingerprint = createHash("sha256")
    .update(`${salt}:${normalizedPhone}|${propertyRef._id.toString()}`)
    .digest("hex")
    .slice(0, 32);

  // Find or create lead first
  let lead = await Lead.findOne({ normalizedPhone });
  if (!lead) {
    lead = new Lead({
      referenceNumber: generateReferenceNumber(),
      fullName: args.fullName.trim(),
      normalizedPhone,
      displayPhone,
      preferredContactMethod: "PHONE",
      source: "OTHER",
      utmSource: "AI_CHATBOT",
      propertyId: propertyRef._id,
      locationId: propertyRef.locationId?._id || propertyRef.locationId,
      status: "NEW",
      priority: "HIGH",
      submissionFingerprint: fingerprint,
      consentGranted: true,
      consentTimestamp: new Date(),
      consentSource: "AI_CHATBOT_VISIT",
      consentPurpose: "PROPERTY_ENQUIRY",
      consentTextVersion: "1.0",
      privacyPolicyVersion: "1.0",
      retentionReviewAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      timeline: [
        {
          eventType: "INQUIRY_SUBMITTED",
          actorType: "SYSTEM",
          summary: "Lead created via Chatbot Site Visit booking.",
          occurredAt: new Date(),
        },
      ],
    });
    await lead.save();
  }

  // Parse date
  const visitDate = new Date(args.preferredDate);
  if (isNaN(visitDate.getTime())) {
    return {
      success: false,
      error: "Invalid preferred date provided. Please use YYYY-MM-DD format.",
    };
  }

  const visitRefNumber = generateReferenceNumber();

  const siteVisit = new SiteVisit({
    referenceNumber: visitRefNumber,
    leadId: lead._id,
    propertyId: propertyRef._id,
    locationId: propertyRef.locationId?._id || propertyRef.locationId,
    requestedBy: "CUSTOMER",
    source: "OTHER",
    requestedStartAt: visitDate,
    requestedEndAt: new Date(visitDate.getTime() + 60 * 60 * 1000), // 1 hour duration
    timezone: "Asia/Kolkata",
    durationMinutes: 60,
    bufferBeforeMinutes: 15,
    bufferAfterMinutes: 15,
    meetingMode: "IN_PERSON",
    visitorCount: args.visitorCount || 1,
    meetingPointLabel: args.meetingPoint || "Main Gate / Site Office",
    status: "REQUESTED",
    priority: "HIGH",
    confirmationStatus: "UNCONFIRMED",
    timeline: [
      {
        eventType: "VISIT_REQUESTED",
        actorType: "CUSTOMER",
        summary: `Site visit requested for ${propertyRef.title} via AI Chatbot on ${args.preferredDate} (${args.preferredTimeSlot || "Morning"}).`,
        occurredAt: new Date(),
      },
    ],
  });

  await siteVisit.save();

  logger.info("Site visit requested via Chatbot", {
    visitRefNumber,
    property: propertyRef.title,
    date: args.preferredDate,
  });

  return {
    success: true,
    referenceNumber: visitRefNumber,
    leadReferenceNumber: lead.referenceNumber,
    projectTitle: propertyRef.title,
    requestedDate: args.preferredDate,
    timeSlot: args.preferredTimeSlot || "Morning",
    message: `Your site visit request for ${propertyRef.title} has been booked (Visit Reference: ${visitRefNumber})! Our team will call you to confirm directions and pickup if needed.`,
  };
}

// ─── 4. Master Tool Dispatcher ────────────────────────────────────────────────

export async function dispatchToolCall(toolName: string, rawArguments: string): Promise<{ result: any }> {
  let parsedArgs: any = {};
  try {
    parsedArgs = JSON.parse(rawArguments || "{}");
  } catch (err) {
    logger.error("Failed to parse tool call arguments", { toolName, rawArguments, error: err });
    return { result: { error: "Invalid JSON arguments for tool call." } };
  }

  logger.info("Executing Chatbot tool", { toolName, args: parsedArgs });

  try {
    switch (toolName) {
      case "search_projects":
        return { result: await executeSearchProjects(parsedArgs) };
      case "get_project_details":
        return { result: await executeGetProjectDetails(parsedArgs) };
      case "compare_projects":
        return { result: await executeCompareProjects(parsedArgs) };
      case "get_project_amenities":
        return { result: await executeGetProjectAmenities(parsedArgs) };
      case "get_project_media":
        return { result: await executeGetProjectMedia(parsedArgs) };
      case "get_project_availability":
        return { result: await executeGetProjectAvailability(parsedArgs) };
      case "get_project_pricing":
        return { result: await executeGetProjectPricing(parsedArgs) };
      case "get_project_plot_sizes":
        return { result: await executeGetProjectPlotSizes(parsedArgs) };
      case "search_inventory_by_size":
        return { result: await executeSearchInventoryBySize(parsedArgs) };
      case "get_unit_availability":
        return { result: await executeGetUnitAvailability(parsedArgs) };
      case "create_lead":
        return { result: await executeCreateLead(parsedArgs) };
      case "request_site_visit":
        return { result: await executeRequestSiteVisit(parsedArgs) };
      default:
        return { result: { error: `Unrecognized tool name: "${toolName}".` } };
    }
  } catch (err: any) {
    logger.error("Tool execution failed", { toolName, error: err?.message || err });
    return { result: { error: `Internal execution error: ${err?.message || "Unknown error"}` } };
  }
}
