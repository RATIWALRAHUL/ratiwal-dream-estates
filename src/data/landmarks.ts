export type LandmarkCategory = "property" | "airport" | "hospital" | "station" | "expressway" | "commercial";

export interface Landmark {
  id: string;
  name: string;
  category: LandmarkCategory;
  categoryLabel: string;
  region: "Rajasthan" | "Maharashtra";
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  description: string;
  highlight?: string;
  propertySlug?: string;
  priceLabel?: string;
  propertyType?: string;
  imageUrl?: string;
}

export const primeLandmarks: Landmark[] = [
  // ================= PROPERTIES (VERIFIED) =================
  {
    id: "prop-royal-palms",
    name: "Royal Palms Township — Ajmer Road",
    category: "property",
    categoryLabel: "Verified Plotted Township",
    region: "Rajasthan",
    city: "Jaipur",
    coordinates: {
      latitude: 26.8428,
      longitude: 75.6415,
    },
    description: "JDA-approved masterplanned township near Mahindra World City SEZ with 60ft sector roads & underground utilities.",
    highlight: "JDA Approved • 28 Acres Gated Masterplan",
    propertySlug: "royal-palms-township-ajmer-road-jaipur",
    priceLabel: "₹28.5 Lakhs Onwards",
    propertyType: "Residential Plot",
    imageUrl: "/images/about/township-development.jpg",
  },
  {
    id: "prop-ring-road-hub",
    name: "Ring Road Logistics & Commercial Hub",
    category: "property",
    categoryLabel: "Verified Commercial Hub",
    region: "Rajasthan",
    city: "Jaipur",
    coordinates: {
      latitude: 26.7915,
      longitude: 75.7620,
    },
    description: "200ft expressway frontage commercial & logistics land with 90A commercial title conversion.",
    highlight: "6-Lane Freight Bypass Frontage",
    propertySlug: "ring-road-logistics-commercial-hub-jaipur",
    priceLabel: "₹1.45 Cr Onwards",
    propertyType: "Commercial Plot",
    imageUrl: "/images/locations/jaipur.jpg",
  },
  {
    id: "prop-imperial-enclave",
    name: "Imperial Enclave — Tonk Road",
    category: "property",
    categoryLabel: "Verified Gated Enclave",
    region: "Rajasthan",
    city: "Jaipur",
    coordinates: {
      latitude: 26.7820,
      longitude: 75.8340,
    },
    description: "Premium villa plotted community 15 mins from Jaipur International Airport near healthcare campuses.",
    highlight: "JDA Sanctioned • 15 Mins to Airport",
    propertySlug: "imperial-enclave-tonk-road-jaipur",
    priceLabel: "₹42.0 Lakhs Onwards",
    propertyType: "Villa Plotted Land",
    imageUrl: "/images/about/office-consultation.jpg",
  },
  {
    id: "prop-aerotropolis",
    name: "Aerotropolis Prime Plotted Node",
    category: "property",
    categoryLabel: "Verified MMR Growth Node",
    region: "Maharashtra",
    city: "Navi Mumbai",
    coordinates: {
      latitude: 18.9894,
      longitude: 73.1175,
    },
    description: "NAINA CIDCO planned plotted cluster in prime proximity to the new Navi Mumbai International Airport (NMIAL).",
    highlight: "CIDCO NAINA Approved • 10 Mins to NMIAL",
    propertySlug: "aerotropolis-prime-plotted-node-navi-mumbai",
    priceLabel: "₹85.0 Lakhs Onwards",
    propertyType: "Residential & Mixed-Use",
    imageUrl: "/images/about/township-development.jpg",
  },
  {
    id: "prop-scenic-retreat",
    name: "Scenic Retreat Villa Plots — Ajmer-Pushkar",
    category: "property",
    categoryLabel: "Verified Luxury Retreat",
    region: "Rajasthan",
    city: "Ajmer",
    coordinates: {
      latitude: 26.4499,
      longitude: 74.6399,
    },
    description: "ADA sanctioned panoramic scenic villa plots along the Ajmer-Pushkar foothills corridor.",
    highlight: "ADA Sanctioned • Mountain View Foothills",
    propertySlug: "scenic-retreat-villa-plot-ajmer-pushkar",
    priceLabel: "₹22.5 Lakhs Onwards",
    propertyType: "Luxury Villa Plot",
    imageUrl: "/images/locations/jaipur.jpg",
  },
  {
    id: "prop-bhiwadi-industrial",
    name: "Delhi-NCR Plotted Logistics Belt",
    category: "property",
    categoryLabel: "Verified Industrial Hub",
    region: "Rajasthan",
    city: "Bhiwadi",
    coordinates: {
      latitude: 28.2105,
      longitude: 76.8606,
    },
    description: "RIICO recognized plotted logistics hub along the NH-48 Delhi-Jaipur industrial spine.",
    highlight: "RIICO & DMIC Corridor Linkage",
    propertySlug: "bhiwadi-delhi-ncr-industrial-plots",
    priceLabel: "₹65.0 Lakhs Onwards",
    propertyType: "Industrial & Logistics",
    imageUrl: "/images/about/office-consultation.jpg",
  },

  // ================= AIRPORTS =================
  {
    id: "air-jaipur",
    name: "Jaipur International Airport (JAI)",
    category: "airport",
    categoryLabel: "International Airport",
    region: "Rajasthan",
    city: "Jaipur",
    coordinates: {
      latitude: 26.8289,
      longitude: 75.8056,
    },
    description: "Primary international aviation hub for Rajasthan with expanding passenger terminal & air-cargo infrastructure.",
    highlight: "15–25 mins drive from all our Jaipur plotted communities",
  },
  {
    id: "air-nmial",
    name: "Navi Mumbai International Airport (NMIAL)",
    category: "airport",
    categoryLabel: "International Greenfield Airport",
    region: "Maharashtra",
    city: "Navi Mumbai",
    coordinates: {
      latitude: 18.9892,
      longitude: 73.0722,
    },
    description: "State-of-the-art greenfield international airport anchoring the entire NAINA aerotropolis expansion zone.",
    highlight: "10 mins from Aerotropolis Prime Plotted Node",
  },
  {
    id: "air-bom",
    name: "Chhatrapati Shivaji Maharaj Airport (BOM)",
    category: "airport",
    categoryLabel: "Commercial Airport",
    region: "Maharashtra",
    city: "Mumbai",
    coordinates: {
      latitude: 19.0896,
      longitude: 72.8656,
    },
    description: "Mumbai's primary international aviation gateway connected to Navi Mumbai via Atal Setu (MTHL).",
    highlight: "Connected via Atal Setu Sea Bridge Expressway",
  },
  {
    id: "air-kishangarh",
    name: "Kishangarh Airport (KQH)",
    category: "airport",
    categoryLabel: "Regional Airport",
    region: "Rajasthan",
    city: "Ajmer",
    coordinates: {
      latitude: 26.6025,
      longitude: 74.8152,
    },
    description: "Operational regional airport serving Ajmer, Pushkar, and the marble industrial hub.",
    highlight: "25 mins from Ajmer-Pushkar Scenic Retreat plots",
  },

  // ================= MAJOR HOSPITALS =================
  {
    id: "hosp-fortis",
    name: "Fortis Escorts Hospital",
    category: "hospital",
    categoryLabel: "Super-Specialty Hospital",
    region: "Rajasthan",
    city: "Jaipur",
    coordinates: {
      latitude: 26.8480,
      longitude: 75.8020,
    },
    description: "Leading multi-specialty tertiary care hospital in Jaipur (JLN Marg / Malviya Nagar).",
    highlight: "NABH Accredited Tertiary Care",
  },
  {
    id: "hosp-apex",
    name: "Apex Hospitals & Research Centre",
    category: "hospital",
    categoryLabel: "Multi-Specialty Hospital",
    region: "Rajasthan",
    city: "Jaipur",
    coordinates: {
      latitude: 26.8520,
      longitude: 75.8190,
    },
    description: "Advanced surgical & emergency care facility serving South Jaipur & Ring Road corridors.",
    highlight: "24/7 Trauma & Critical Care",
  },
  {
    id: "hosp-mgm",
    name: "MGM Medical College & Hospital",
    category: "hospital",
    categoryLabel: "Medical College & Super-Specialty",
    region: "Maharashtra",
    city: "Navi Mumbai",
    coordinates: {
      latitude: 19.0230,
      longitude: 73.0930,
    },
    description: "Premier 1,000-bed university hospital and healthcare campus in Kamothe/Panvel node.",
    highlight: "Top Healthcare Hub in MMR NAINA Belt",
  },
  {
    id: "hosp-jln",
    name: "JLN Government Medical College Hospital",
    category: "hospital",
    categoryLabel: "Apex Medical Hospital",
    region: "Rajasthan",
    city: "Ajmer",
    coordinates: {
      latitude: 26.4750,
      longitude: 74.6380,
    },
    description: "Central Rajasthan's premier referral medical college hospital serving Ajmer division.",
    highlight: "Largest Tertiary Hospital in Central Rajasthan",
  },

  // ================= RAILWAY & METRO STATIONS =================
  {
    id: "stn-jaipur-jn",
    name: "Jaipur Junction Railway Station",
    category: "station",
    categoryLabel: "Major Railway Junction",
    region: "Rajasthan",
    city: "Jaipur",
    coordinates: {
      latitude: 26.9196,
      longitude: 75.7878,
    },
    description: "A1 category railway hub connecting Jaipur to Delhi, Mumbai, Ahmedabad & Kolkata on broad gauge.",
    highlight: "Vande Bharat & Superfast Express Connectivity",
  },
  {
    id: "stn-mansarovar-metro",
    name: "Mansarovar Metro Terminal",
    category: "station",
    categoryLabel: "Metro Rail Station",
    region: "Rajasthan",
    city: "Jaipur",
    coordinates: {
      latitude: 26.8790,
      longitude: 75.7610,
    },
    description: "Jaipur Metro Phase 1 Terminal Station with direct access to Ajmer Road growth corridor.",
    highlight: "High-Speed Transit into Walled City Core",
  },
  {
    id: "stn-panvel-jn",
    name: "Panvel Junction Railway Station",
    category: "station",
    categoryLabel: "Intercity & Suburban Railway Terminus",
    region: "Maharashtra",
    city: "Navi Mumbai",
    coordinates: {
      latitude: 18.9902,
      longitude: 73.1215,
    },
    description: "Major terminus for Konkan Railway, Central Railway suburban trains & proposed high-speed lines.",
    highlight: "Suburban EMU & Konkan Route Terminus",
  },
  {
    id: "stn-ajmer-jn",
    name: "Ajmer Junction Railway Station",
    category: "station",
    categoryLabel: "Division Railway Headquarters",
    region: "Rajasthan",
    city: "Ajmer",
    coordinates: {
      latitude: 26.4560,
      longitude: 74.6360,
    },
    description: "North Western Railway divisional junction connecting Delhi-Ahmedabad trunk mainline.",
    highlight: "Delhi-Ahmedabad Vande Bharat Route",
  },

  // ================= EXPRESSWAYS & HIGHWAYS =================
  {
    id: "exp-jaipur-ring-road",
    name: "Jaipur 6-Lane Ring Road Expressway",
    category: "expressway",
    categoryLabel: "Access-Controlled Expressway",
    region: "Rajasthan",
    city: "Jaipur",
    coordinates: {
      latitude: 26.8050,
      longitude: 75.7150,
    },
    description: "47-km operational 6-lane access-controlled expressway linking Ajmer Road (NH-48), Tonk Road (NH-52) & Agra Road (NH-21).",
    highlight: "Primary High-Growth Plotted Development Loop",
  },
  {
    id: "exp-dme-interchange",
    name: "Delhi-Mumbai Expressway Interchange",
    category: "expressway",
    categoryLabel: "8-Lane Megaproject Expressway",
    region: "Rajasthan",
    city: "Jaipur",
    coordinates: {
      latitude: 26.8850,
      longitude: 75.6800,
    },
    description: "Flagship access-controlled Greenfield expressway reducing Delhi-Jaipur drive time to ~3.5 hours.",
    highlight: "Flagship National Logistics Spine",
  },
  {
    id: "exp-atal-setu",
    name: "Atal Setu (MTHL) Sea Bridge Landing",
    category: "expressway",
    categoryLabel: "Trans-Harbour Sea Link",
    region: "Maharashtra",
    city: "Navi Mumbai",
    coordinates: {
      latitude: 18.9560,
      longitude: 73.0180,
    },
    description: "21.8 km 6-lane sea bridge connecting South Mumbai (Sewri) to Navi Mumbai (Chirle) in 20 minutes.",
    highlight: "20 Mins Direct Drive to South Mumbai",
  },
  {
    id: "exp-mumbai-pune",
    name: "Mumbai-Pune Expressway Gateway",
    category: "expressway",
    categoryLabel: "6-Lane Concrete Expressway",
    region: "Maharashtra",
    city: "Navi Mumbai",
    coordinates: {
      latitude: 18.9810,
      longitude: 73.1350,
    },
    description: "India's first 6-lane high-speed expressway originating from Kalamboli/Panvel towards Pune IT hubs.",
    highlight: "Western India's Busiest Commercial Artery",
  },

  // ================= SEZS & TECH PARKS =================
  {
    id: "com-mahindra-sez",
    name: "Mahindra World City Multi-Product SEZ",
    category: "commercial",
    categoryLabel: "3,000-Acre Multi-Product SEZ",
    region: "Rajasthan",
    city: "Jaipur",
    coordinates: {
      latitude: 26.8510,
      longitude: 75.6120,
    },
    description: "3,000-acre global business city hosting Infosys, JCB, Deutsche Bank, Appirio, Pawa & 70+ multinational companies.",
    highlight: "100,000+ Direct High-Skill Employment Hub",
  },
  {
    id: "com-manipal-univ",
    name: "Manipal University Academic City",
    category: "commercial",
    categoryLabel: "Premier University Campus",
    region: "Rajasthan",
    city: "Jaipur",
    coordinates: {
      latitude: 26.8430,
      longitude: 75.5650,
    },
    description: "122-acre modern residential university campus driving massive student and faculty housing demand.",
    highlight: "Leading Higher Education Hub in Ajmer Road Belt",
  },
  {
    id: "com-naina-tech",
    name: "NAINA Smart City & Commercial Node",
    category: "commercial",
    categoryLabel: "CIDCO Planned Smart City",
    region: "Maharashtra",
    city: "Navi Mumbai",
    coordinates: {
      latitude: 19.0050,
      longitude: 73.1420,
    },
    description: "CIDCO's masterplanned 371 sq. km smart city node surrounding the Navi Mumbai airport and logistics zones.",
    highlight: "India's Largest Airport-Adjacent Urban Plan",
  },
];
