import { Location } from "../types/location";
import { properties } from "./properties";

export const locations: Location[] = [
  {
    id: "loc-jaipur",
    slug: "jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    region: "North-Western Growth Corridor",
    tagline: "Planned plotted expansion along 6-lane ring road & industrial SEZs",
    shortDescription:
      "Rajasthan's capital city and premier plotted land market, anchored by Jaipur Development Authority (JDA) masterplans, the operational 6-lane Ring Road, and the high-employment Ajmer Road IT/SEZ corridor.",
    longDescription:
      "Jaipur represents one of North India's most structured and regulated plotted real-estate markets. With extensive sectoral zoning overseen by the Jaipur Development Authority (JDA), development is heavily concentrated along arterial growth vectors including the NH-48 Ajmer Road expressway, the 200ft Southern Ring Road loop, and the Tonk Road institutional corridor. The city combines clear 90A revenue conversion protocols with expanding infrastructure, making it a primary destination for residential township living and institutional commercial land banking.",
    heroImage: "/images/locations/jaipur.jpg",
    coordinates: {
      latitude: 26.9124,
      longitude: 75.7873,
    },
    featured: true,
    propertyTypes: ["Residential Plots", "Commercial Plots", "Mixed-Use Township Land"],
    microMarkets: [
      {
        id: "mm-jaipur-ajmer-rd",
        name: "Ajmer Road Growth Corridor",
        tagline: "Primary IT/SEZ employment and master-planned residential belt",
        description:
          "Anchored by Mahindra World City SEZ and prominent educational institutions, Ajmer Road is Jaipur's fastest-expanding plotted residential vector with 60ft-100ft sectoral road layouts and JDA sanctions.",
        propertyTypes: ["Residential Plots", "Township Villa Land"],
        connectivityContext: "Direct NH-48 expressway access and feeder connectivity to the Ring Road interchange.",
        highlights: [
          "Adjacent to 3,000-acre Mahindra World City Multi-Product SEZ",
          "Wide 60ft & 40ft sectoral road grids with underground cabling",
          "Concentration of top schools, universities & hospital campuses",
        ],
        regulatoryAuthority: "Jaipur Development Authority (JDA)",
        relevantPropertySlugs: ["royal-palms-township-ajmer-road-jaipur"],
      },
      {
        id: "mm-jaipur-ring-rd",
        name: "Jaipur Ring Road Commercial Loop",
        tagline: "High-speed 6-lane freight bypass and logistics corridor",
        description:
          "Connecting NH-48 (Ajmer Road) to NH-52 (Tonk Road) and NH-21 (Agra Road), the Ring Road corridor provides institutional commercial parcels, warehousing hubs, and high-visibility highway frontage.",
        propertyTypes: ["Commercial Plots", "Logistics & Warehouse Land"],
        connectivityContext: "Direct entry to 6-lane expressway loop bypassing internal city traffic.",
        highlights: [
          "Direct 200ft / 6-lane expressway frontage with designated commercial zoning",
          "Dedicated heavy vehicle movement with cloverleaf interchanges",
          "High capital appreciation driven by freight & logistics decentralization",
        ],
        regulatoryAuthority: "Jaipur Development Authority (JDA)",
        relevantPropertySlugs: ["ring-road-logistics-commercial-hub-jaipur"],
      },
      {
        id: "mm-jaipur-tonk-rd",
        name: "Tonk Road & Vatika Sector",
        tagline: "Established institutional and medical education residential belt",
        description:
          "The southern residential growth artery featuring established social infrastructure, medical institutions (Mahatma Gandhi Medical College), and seamless link to Sitapura Industrial Zone.",
        propertyTypes: ["Residential Plots", "Gated Township Land"],
        connectivityContext: "15 minutes to Jaipur International Airport via elevated Tonk Road corridor.",
        highlights: [
          "Immediate livability with developed civic and institutional infrastructure",
          "Direct connectivity to Sitapura Industrial Area & JECC Convention Centre",
          "High residential rental demand from healthcare and academic professionals",
        ],
        regulatoryAuthority: "Jaipur Development Authority (JDA)",
        relevantPropertySlugs: ["imperial-enclave-tonk-road-jaipur"],
      },
    ],
    infrastructure: [
      {
        id: "inf-jaipur-ring-road",
        name: "Jaipur 6-Lane Ring Road (Phase 1 & 2)",
        category: "Highway & Expressways",
        status: "Operational",
        description:
          "47-km operational 6-lane access-controlled expressway linking Ajmer Road, Tonk Road, and Agra Road, drastically reducing freight transit times and creating peripheral commercial corridors.",
        source: "Jaipur Development Authority (JDA) Project Report",
        sourceUrl: "https://jda.urban.rajasthan.gov.in",
        lastVerifiedAt: "2026-08-01",
      },
      {
        id: "inf-jaipur-dme",
        name: "Delhi-Mumbai Expressway (Jaipur Spur Connection)",
        category: "Highway & Expressways",
        status: "Operational",
        description:
          "Direct 8-lane expressway connectivity reducing Jaipur-to-Delhi transit time to ~3.5 hours, with key interchanges connecting to the Ring Road.",
        source: "National Highways Authority of India (NHAI)",
        sourceUrl: "https://nhai.gov.in",
        lastVerifiedAt: "2026-07-15",
      },
      {
        id: "inf-jaipur-metro-ext",
        name: "Jaipur Metro Phase 2 & Feeder Network",
        category: "Rail & Metro",
        status: "Proposed",
        description:
          "Planned north-south metro corridor connecting Sitapura / Tonk Road corridor to Ambabari, currently under DPR review and central appraisal.",
        source: "Jaipur Metro Rail Corporation (JMRC)",
        sourceUrl: "https://transport.rajasthan.gov.in/jmrc",
        lastVerifiedAt: "2026-06-20",
      },
      {
        id: "inf-jaipur-mwc",
        name: "Mahindra World City SEZ Expansion",
        category: "Industrial & Logistics",
        status: "Operational",
        description:
          "3,000-acre operational multi-product Special Economic Zone housing 100+ global enterprises (Infosys, JCB, Deutsche Bank, Genpact) employing over 40,000 professionals.",
        source: "Mahindra World City Jaipur Operations",
        lastVerifiedAt: "2026-08-10",
      },
    ],
    connectivity: [
      {
        destination: "Mahindra World City SEZ",
        distanceKm: 4.5,
        approxTravelTime: "8 mins",
        travelMode: "Drive / Highway",
        route: "Via NH-48 Ajmer Expressway",
        lastVerifiedAt: "2026-08-10",
      },
      {
        destination: "Jaipur International Airport (JAI)",
        distanceKm: 22,
        approxTravelTime: "28 mins",
        travelMode: "Drive / Highway",
        route: "Via Jaipur Ring Road / Tonk Road Elevated",
        lastVerifiedAt: "2026-08-10",
      },
      {
        destination: "Jaipur Junction Railway Station",
        distanceKm: 18,
        approxTravelTime: "30 mins",
        travelMode: "Drive / Highway",
        route: "Via Ajmer Road Flyover",
        lastVerifiedAt: "2026-08-10",
      },
      {
        destination: "Delhi-Mumbai Expressway Interchange",
        distanceKm: 28,
        approxTravelTime: "25 mins",
        travelMode: "Drive / Highway",
        route: "Via Agra Road / Ring Road Loop",
        lastVerifiedAt: "2026-08-10",
      },
    ],
    buyerConsiderations: [
      {
        title: "Section 90A Land Conversion Order",
        category: "Title & Documentation",
        description:
          "Ensure the land parcel possesses a valid Section 90A order issued by the competent Revenue/JDA authority confirming conversion from agricultural to residential/commercial use.",
        importance: "Mandatory Due Diligence",
      },
      {
        title: "JDA Approved Layout Plan & Patta Issuance",
        category: "Statutory Approvals",
        description:
          "Verify the approved layout scheme map against physical site boundary pegs and ensure eligibility for direct JDA Name Transfer / Patta issuance.",
        importance: "Mandatory Due Diligence",
      },
      {
        title: "RERA Registration for Plotted Schemes",
        category: "Regulatory Verification",
        description:
          "Commercial and residential plotted townships exceeding 500 sq meters or 8 plots must carry valid Rajasthan RERA registration with verified escrow bank accounts.",
        importance: "Regulatory Verification",
      },
      {
        title: "Sectoral Road Width & Setback Demarcation",
        category: "Access & Infrastructure",
        description:
          "Check masterplan road alignments (e.g. 60ft, 100ft, 200ft) to ensure proposed access roads are fully acquired and physically motorable.",
        importance: "Strategic Advantage",
      },
    ],
    marketData: {
      priceRangePerSqYd: "₹18,500 – ₹45,000 / Sq. Yd",
      commercialRangePerSqFt: "₹3,200 – ₹7,800 / Sq. Ft",
      dominantPlotSizes: ["111 Sq. Yds", "166 Sq. Yds", "200 Sq. Yds", "500+ Sq. Yds"],
      activeGrowthCorridors: ["Ajmer Road NH-48", "Jaipur Ring Road Corridor", "Tonk Road Vatika Axis"],
      documentationStandard: "JDA 90A Approval & Clear Revenue Jamabandi",
      sourceNote: "Compiled from verified JDA sectoral scheme registrations and sub-registrar transaction records.",
      lastVerifiedAt: "August 2026",
    },
    faq: [
      {
        question: "What is Section 90A approval in Jaipur and why is it essential?",
        answer:
          "Under the Rajasthan Land Revenue Act, Section 90A is the statutory government order that converts agricultural land into non-agricultural use (residential or commercial). It ensures the parcel has clear ownership, is free from agricultural ceilings, and is legally permitted for plotting and construction.",
      },
      {
        question: "Which micro-markets in Jaipur offer the highest infrastructure support?",
        answer:
          "The Ajmer Road corridor (benefiting from Mahindra World City SEZ and direct NH-48 transit) and the Southern Ring Road corridor (providing 6-lane access between major highways) currently feature the strongest statutory planning, underground utilities, and institutional connectivity.",
      },
      {
        question: "How does Ratiwal Dream Estates verify Jaipur property listings?",
        answer:
          "Every listed plot undergoes a rigorous 4-step due diligence: 30-year revenue search, JDA/ADA sanction map verification, Khasra-to-layout superimposition, and on-ground Total Station boundary verification before recommendation.",
      },
    ],
    lastVerifiedAt: "2026-08-15",
  },
  {
    id: "loc-navi-mumbai",
    slug: "navi-mumbai",
    name: "Navi Mumbai",
    state: "Maharashtra",
    region: "Mumbai Metropolitan Region (MMR)",
    tagline: "Planned megacity node powered by NMIA Aerotropolis & Atal Setu (MTHL)",
    shortDescription:
      "India's premier planned metropolitan node in Maharashtra, driven by the Navi Mumbai International Airport (NMIA), the operational Atal Setu sea bridge, and CIDCO/NAINA master-planned infrastructure.",
    longDescription:
      "Navi Mumbai represents the most transformative growth pole in the Mumbai Metropolitan Region (MMR). Master-planned by CIDCO and expanded through the NAINA (Navi Mumbai Airport Influence Notified Area) authority, the market is benefiting from massive infrastructure convergence. With direct 20-minute connectivity to South Mumbai via the operational Atal Setu (MTHL) and the upcoming commercial operationalization of NMIA, plotted and commercial opportunities in this region offer institutional-grade capital stability and long-term economic compounding.",
    heroImage: "/images/locations/navi-mumbai.jpg",
    coordinates: {
      latitude: 19.0330,
      longitude: 73.0297,
    },
    featured: true,
    propertyTypes: ["Commercial Plots", "NAINA Plotted Schemes", "Industrial Land"],
    microMarkets: [
      {
        id: "mm-nm-naina",
        name: "Panvel & NAINA Aerotropolis Influence Zone",
        tagline: "Direct airport catchment node with CIDCO town planning schemes",
        description:
          "Spread across notified nodes surrounding the upcoming Navi Mumbai International Airport, NAINA represents CIDCO's structured town planning framework with wide arterial roads and designated commercial hubs.",
        propertyTypes: ["Commercial Plots", "NA Plotted Layouts"],
        connectivityContext: "10-15 minutes to NMIA passenger terminals and Panvel railway junction.",
        highlights: [
          "Immediate proximity to Navi Mumbai International Airport (NMIA)",
          "CIDCO NAINA approved sectoral layout with non-agricultural clearance",
          "Interconnected to Virar-Alibaug Multi-Modal Corridor network",
        ],
        regulatoryAuthority: "CIDCO / NAINA / MahaRERA",
        relevantPropertySlugs: ["aerotropolis-prime-plotted-node-navi-mumbai"],
      },
      {
        id: "mm-nm-mthl-corridor",
        name: "Atal Setu (MTHL) Coastal Growth Axis",
        tagline: "Direct 20-minute vehicular conduit to South Mumbai",
        description:
          "The coastal and trans-harbour landing corridor providing unprecedented speed of connectivity between Sewri (Mumbai) and Chirle/Ulwe nodes, transforming commercial and plotted land dynamics.",
        propertyTypes: ["Commercial Plots", "Institutional Land"],
        connectivityContext: "Direct access via Atal Setu trans-harbour sea link interchange.",
        highlights: [
          "Operational 21.8 km 6-lane trans-harbour sea bridge",
          "Drastic reduction in transit time to Mumbai financial districts",
          "Surrounding port and logistics connectivity linked to JNPT",
        ],
        regulatoryAuthority: "CIDCO / MMRDA",
        relevantPropertySlugs: ["aerotropolis-prime-plotted-node-navi-mumbai"],
      },
    ],
    infrastructure: [
      {
        id: "inf-nm-mthl",
        name: "Atal Bihari Vajpayee Sewri-Nhava Sheva Atal Setu (MTHL)",
        category: "Highway & Expressways",
        status: "Operational",
        description:
          "21.8 km 6-lane trans-harbour sea bridge operationalized in Jan 2024, connecting Sewri in South Mumbai to Chirle in Navi Mumbai in under 20 minutes.",
        source: "Mumbai Metropolitan Region Development Authority (MMRDA)",
        sourceUrl: "https://mmrda.maharashtra.gov.in",
        lastVerifiedAt: "2026-08-01",
      },
      {
        id: "inf-nm-airport",
        name: "Navi Mumbai International Airport (NMIA — Phase 1)",
        category: "Airport & Aviation",
        status: "Under construction",
        description:
          "Greenfield international airport developed by Adani Airport Holdings in partnership with CIDCO, designed for initial 20 million passenger annual capacity.",
        source: "CIDCO & Ministry of Civil Aviation (MoCA)",
        sourceUrl: "https://cidco.maharashtra.gov.in",
        lastVerifiedAt: "2026-08-05",
      },
      {
        id: "inf-nm-metro",
        name: "Navi Mumbai Metro Line 1 (Belapur to Pendhar)",
        category: "Rail & Metro",
        status: "Operational",
        description:
          "11.1 km operational metro line connecting CBD Belapur to Pendhar near Taloja, with planned extension toward the international airport.",
        source: "CIDCO Metro Operations",
        lastVerifiedAt: "2026-07-20",
      },
      {
        id: "inf-nm-mmc",
        name: "Virar-Alibaug Multi-Modal Corridor (VAMC)",
        category: "Highway & Expressways",
        status: "Under construction",
        description:
          "126-km high-speed multi-modal transport corridor connecting Virar, Bhiwandi, Kalyan, Panvel, Pen, and Alibaug with dedicated metro and freight lanes.",
        source: "Maharashtra State Road Development Corporation (MSRDC)",
        sourceUrl: "https://msrdc.in",
        lastVerifiedAt: "2026-07-10",
      },
    ],
    connectivity: [
      {
        destination: "Navi Mumbai International Airport (NMIA)",
        distanceKm: 8,
        approxTravelTime: "15 mins",
        travelMode: "Drive / Highway",
        route: "Via Amra Marg & NH-48",
        lastVerifiedAt: "2026-08-05",
      },
      {
        destination: "South Mumbai (Sewri / Nariman Point via MTHL)",
        distanceKm: 24,
        approxTravelTime: "25 mins",
        travelMode: "Drive / Highway",
        route: "Via Atal Setu (MTHL) Expressway",
        lastVerifiedAt: "2026-08-05",
      },
      {
        destination: "Panvel Railway & Suburban Terminus",
        distanceKm: 6,
        approxTravelTime: "12 mins",
        travelMode: "Drive / Highway",
        route: "Via Old Mumbai-Pune Highway",
        lastVerifiedAt: "2026-08-05",
      },
      {
        destination: "JNPT Freight Port Terminal",
        distanceKm: 16,
        approxTravelTime: "20 mins",
        travelMode: "Drive / Highway",
        route: "Via NH-348 Port Corridor",
        lastVerifiedAt: "2026-08-05",
      },
    ],
    buyerConsiderations: [
      {
        title: "7/12 Extract (Saat Baara) & Mutation Clear Title",
        category: "Title & Documentation",
        description:
          "Examine the computerized revenue 7/12 extract for zero encumbrance, clean tenancy history, and absence of agricultural transfer restrictions.",
        importance: "Mandatory Due Diligence",
      },
      {
        title: "Non-Agricultural (NA) Sanction Order",
        category: "Zoning & Land Use",
        description:
          "Verify the Collector / CIDCO Non-Agricultural sanction order specifying the permissible land usage (residential, commercial, or IT/logistics).",
        importance: "Mandatory Due Diligence",
      },
      {
        title: "MahaRERA Registration for Plotted Townships",
        category: "Regulatory Verification",
        description:
          "All ongoing plotted developments in Maharashtra must comply with MahaRERA project disclosure and verified title certificate norms.",
        importance: "Regulatory Verification",
      },
      {
        title: "CIDCO / NAINA Master Development Plan Alignment",
        category: "Statutory Approvals",
        description:
          "Cross-reference plot boundaries against CIDCO DP sheets to safeguard against reservation zones, green buffers, or road widening alignments.",
        importance: "Strategic Advantage",
      },
    ],
    marketData: {
      priceRangePerSqYd: "₹42,000 – ₹1,20,000 / Sq. Yd (NAINA / Panvel Node)",
      commercialRangePerSqFt: "₹7,500 – ₹18,000 / Sq. Ft",
      dominantPlotSizes: ["250 Sq. Mtrs", "500 Sq. Mtrs", "1,000 Sq. Mtrs"],
      activeGrowthCorridors: ["Panvel-NAINA Aerotropolis Belt", "Atal Setu Chirle/Ulwe Axis", "Taloja MIDC Industrial Node"],
      documentationStandard: "CIDCO / NAINA Sanction & Clear Title 7/12 Extract",
      sourceNote: "Compiled from CIDCO town planning records, MahaRERA registrations, and sub-registrar transaction archives.",
      lastVerifiedAt: "August 2026",
    },
    faq: [
      {
        question: "What is NAINA and how does it impact land investment in Navi Mumbai?",
        answer:
          "NAINA (Navi Mumbai Airport Influence Notified Area) is a planned development authority managed by CIDCO covering over 560 sq km around NMIA. It ensures planned infrastructure, wide sector roads, and organized town planning schemes (TPS), creating institutional security for land buyers.",
      },
      {
        question: "How has Atal Setu (MTHL) impacted connectivity to Navi Mumbai?",
        answer:
          "Atal Setu has cut travel time between South/Central Mumbai and Navi Mumbai from ~100 minutes to ~20 minutes, directly catalyzing commercial and plotted land demand in nodes like Chirle, Ulwe, and Panvel.",
      },
      {
        question: "Can NRI investors purchase non-agricultural plotted land in Maharashtra?",
        answer:
          "Yes, NRI and OCI investors can freely purchase non-agricultural (NA) residential and commercial plots in Maharashtra in compliance with FEMA guidelines and standard RBI repatriation provisions.",
      },
    ],
    lastVerifiedAt: "2026-08-15",
  },
  {
    id: "loc-ajmer",
    slug: "ajmer",
    name: "Ajmer",
    state: "Rajasthan",
    region: "Central Rajasthan Tourism & Heritage Hub",
    tagline: "Heritage tourism corridor and scenic Aravalli plotted retreats",
    shortDescription:
      "Central Rajasthan's prominent cultural and tourism destination, offering scenic plotted developments along the Pushkar Bypass, ADA-approved layouts, and clean mountain environments.",
    longDescription:
      "Ajmer is a historic cultural, spiritual, and educational landmark in Rajasthan, located at the crossroads of NH-48 (Delhi-Mumbai highway) and NH-58. With the operationalization of Kishangarh Airport and the widening of the scenic Pushkar Bypass corridor, Ajmer has emerged as a preferred destination for holiday retreats, eco-villas, boutique homestays, and long-term plotted land investments backed by the Ajmer Development Authority (ADA).",
    heroImage: "/images/locations/ajmer.jpg",
    coordinates: {
      latitude: 26.4499,
      longitude: 74.6399,
    },
    featured: true,
    propertyTypes: ["Residential Plots", "Resort & Retreat Land", "Farmhouse Parcels"],
    microMarkets: [
      {
        id: "mm-ajmer-pushkar-bypass",
        name: "Pushkar Bypass Scenic Highway",
        tagline: "Aravalli mountain foothill corridor for resorts and holiday homes",
        description:
          "A picturesque 4-lane bypass connecting Ajmer city to the heritage town of Pushkar, surrounded by lush Aravalli ranges and clear natural surroundings.",
        propertyTypes: ["Residential Plots", "Eco-Resort Land"],
        connectivityContext: "10 minutes to Pushkar town and 12 minutes to Ajmer Central Station.",
        highlights: [
          "Panoramic Aravalli mountain views with unpolluted air quality",
          "Strong holiday home rental demand driven by year-round tourism",
          "ADA (Ajmer Development Authority) compliant zoning",
        ],
        regulatoryAuthority: "Ajmer Development Authority (ADA)",
        relevantPropertySlugs: ["aravalli-greens-retreat-plots-ajmer"],
      },
      {
        id: "mm-ajmer-kishangarh-axis",
        name: "Kishangarh Airport & Marble Industrial Belt",
        tagline: "Air connectivity hub and commercial trade corridor",
        description:
          "The northern growth artery anchored by Kishangarh Regional Airport and Asia's largest marble processing market on the NH-48 highway.",
        propertyTypes: ["Commercial Plots", "Industrial Logistics Land"],
        connectivityContext: "Direct on NH-48 highway with commercial flight connections.",
        highlights: [
          "Operational regional airport with daily scheduled passenger flights",
          "Heavy commercial liquidity and industrial trade infrastructure",
          "Strategic transit node between Jaipur and Ajmer",
        ],
        regulatoryAuthority: "ADA / RIICO",
        relevantPropertySlugs: ["aravalli-greens-retreat-plots-ajmer"],
      },
    ],
    infrastructure: [
      {
        id: "inf-ajmer-airport",
        name: "Kishangarh Regional Airport (KQH)",
        category: "Airport & Aviation",
        status: "Operational",
        description:
          "Operational airport catering to Ajmer, Pushkar, and Kishangarh with direct flight connectivity to Delhi, Mumbai, and regional commercial capitals.",
        source: "Airports Authority of India (AAI)",
        sourceUrl: "https://aai.aero",
        lastVerifiedAt: "2026-07-25",
      },
      {
        id: "inf-ajmer-pushkar-bypass",
        name: "Ajmer-Pushkar 4-Lane Bypass Upgradation",
        category: "Highway & Expressways",
        status: "Operational",
        description:
          "Upgraded scenic highway providing seamless transit between Ajmer city and Pushkar town while bypassing congested urban cores.",
        source: "Rajasthan Public Works Department (PWD)",
        lastVerifiedAt: "2026-08-01",
      },
      {
        id: "inf-ajmer-smart-city",
        name: "Ajmer Smart City Urban Promenade & Drainage Project",
        category: "Urban Master Planning",
        status: "Operational",
        description:
          "Comprehensive municipal infrastructure upgrades including Anasagar Lakefront promenade revitalization and civic sewerage network.",
        source: "Ajmer Smart City Mission Ltd",
        lastVerifiedAt: "2026-06-30",
      },
    ],
    connectivity: [
      {
        destination: "Pushkar Holy Town & Heritage Center",
        distanceKm: 9,
        approxTravelTime: "12 mins",
        travelMode: "Drive / Highway",
        route: "Via Pushkar Bypass Highway",
        lastVerifiedAt: "2026-08-01",
      },
      {
        destination: "Ajmer Junction Railway Station",
        distanceKm: 7.5,
        approxTravelTime: "15 mins",
        travelMode: "Drive / Highway",
        route: "Via Jaipur Road / Station Road",
        lastVerifiedAt: "2026-08-01",
      },
      {
        destination: "Kishangarh Airport (KQH)",
        distanceKm: 28,
        approxTravelTime: "35 mins",
        travelMode: "Drive / Highway",
        route: "Via NH-48 Expressway",
        lastVerifiedAt: "2026-08-01",
      },
      {
        destination: "Jaipur City Center",
        distanceKm: 130,
        approxTravelTime: "2 hrs",
        travelMode: "Drive / Highway",
        route: "Via 6-lane NH-48 Highway",
        lastVerifiedAt: "2026-08-01",
      },
    ],
    buyerConsiderations: [
      {
        title: "ADA Layout Compliance & Zonal Clearances",
        category: "Statutory Approvals",
        description:
          "Confirm that plotted schemes fall strictly within the ADA sanctioned master layout and carry valid approval reference numbers.",
        importance: "Mandatory Due Diligence",
      },
      {
        title: "Revenue Jamabandi & Parcha Khatauni Verification",
        category: "Title & Documentation",
        description:
          "Inspect current year computerized Jamabandi revenue records to verify legal khatedari rights and absence of family litigation.",
        importance: "Mandatory Due Diligence",
      },
      {
        title: "Eco-Sensitive & Forest Buffer Compliance",
        category: "Zoning & Land Use",
        description:
          "For properties in the Aravalli foothill zone, verify that the land is outside demarcated forest conservation boundaries.",
        importance: "Regulatory Verification",
      },
      {
        title: "Water Table & Borewell Permissions",
        category: "Access & Infrastructure",
        description:
          "Ensure legal access to municipal water connections or groundwater sanction for villa/resort developments.",
        importance: "Strategic Advantage",
      },
    ],
    marketData: {
      priceRangePerSqYd: "₹12,000 – ₹28,000 / Sq. Yd",
      commercialRangePerSqFt: "₹2,200 – ₹5,500 / Sq. Ft",
      dominantPlotSizes: ["150 Sq. Yds", "250 Sq. Yds", "500 Sq. Yds", "1,000+ Sq. Yds"],
      activeGrowthCorridors: ["Pushkar Bypass Corridor", "Jaipur-Ajmer Highway NH-48", "Kishangarh Road"],
      documentationStandard: "ADA Scheme Approval & Registered Revenue Title",
      sourceNote: "Compiled from ADA sanction registers and sub-registrar transaction records.",
      lastVerifiedAt: "August 2026",
    },
    faq: [
      {
        question: "Why is the Pushkar Bypass corridor popular for holiday villas?",
        answer:
          "The corridor offers clean mountain air, panoramic Aravalli valley views, and close proximity to Pushkar's tourism footfall, making it ideal for self-use vacation homes and boutique rental homestays.",
      },
      {
        question: "Are plots in Ajmer suitable for long-term investment?",
        answer:
          "Yes. With operational airport infrastructure at Kishangarh, smart city investments, and direct 6-lane highway links to Jaipur and Delhi, Ajmer provides steady land appreciation with low entry valuations.",
      },
    ],
    lastVerifiedAt: "2026-08-15",
  },
  {
    id: "loc-panvel",
    slug: "panvel",
    name: "Panvel",
    state: "Maharashtra",
    region: "MMR Eastern Gateway",
    tagline: "Multi-modal transport hub and NAINA master-planned aerotropolis node",
    shortDescription:
      "The strategic junction of MMR connecting Mumbai, Pune, and Goa, transformed by the Navi Mumbai International Airport, Panvel railway terminus, and NAINA plotted developments.",
    longDescription:
      "Panvel is the foundational gateway to the Mumbai Metropolitan Region (MMR) and the epicenter of Maharashtra's largest infrastructure investments. Positioned where the Mumbai-Pune Expressway, Sion-Panvel Highway, and NH-66 converge, Panvel combines mature suburban infrastructure with expansive greenfield growth across the CIDCO NAINA aerotropolis zone. It represents a premier choice for plotted community living, logistics warehousing, and institutional land development.",
    heroImage: "/images/locations/panvel.jpg",
    coordinates: {
      latitude: 18.9894,
      longitude: 73.1175,
    },
    featured: true,
    propertyTypes: ["Residential Plots", "Commercial Plots", "NAINA Town Planning Schemes"],
    microMarkets: [
      {
        id: "mm-panvel-naina-core",
        name: "Panvel-NAINA Aerotropolis Node",
        tagline: "Immediate airport influence township zone",
        description:
          "Master-planned CIDCO Town Planning Schemes (TPS) featuring wide grid roads, underground utilities, and close proximity to passenger and cargo airport terminals.",
        propertyTypes: ["Residential Plots", "Commercial Plots"],
        connectivityContext: "10 minutes to NMIA terminals via dedicated arterial boulevards.",
        highlights: [
          "CIDCO NAINA approved town planning layout scheme",
          "Direct access to planned coastal and expressway networks",
          "High institutional and NRI investment concentration",
        ],
        regulatoryAuthority: "CIDCO / NAINA / MahaRERA",
        relevantPropertySlugs: ["aerotropolis-prime-plotted-node-navi-mumbai"],
      },
      {
        id: "mm-panvel-expressway-axis",
        name: "Mumbai-Pune Expressway Gateway",
        tagline: "High-visibility intercity transit and logistics corridor",
        description:
          "The starting node of the Mumbai-Pune Expressway, featuring prominent educational campuses, logistics parks, and plotted residential townships.",
        propertyTypes: ["Commercial Plots", "Logistics Land", "Residential Plots"],
        connectivityContext: "Immediate entry to Mumbai-Pune Expressway and Old Mumbai Highway.",
        highlights: [
          "Unrivaled intercity vehicular access between Mumbai and Pune",
          "Established schools, universities, and medical facilities",
          "Strong capital appreciation driven by highway visibility",
        ],
        regulatoryAuthority: "PMC (Panvel Municipal Corporation) / CIDCO",
        relevantPropertySlugs: ["aerotropolis-prime-plotted-node-navi-mumbai"],
      },
    ],
    infrastructure: [
      {
        id: "inf-panvel-airport",
        name: "Navi Mumbai International Airport (NMIA)",
        category: "Airport & Aviation",
        status: "Under construction",
        description:
          "Mega greenfield international airport bordering Panvel node with initial phase passenger and cargo operations under rapid execution.",
        source: "CIDCO / Ministry of Civil Aviation",
        sourceUrl: "https://cidco.maharashtra.gov.in",
        lastVerifiedAt: "2026-08-05",
      },
      {
        id: "inf-panvel-rail-terminus",
        name: "Panvel Mega Suburban & Outstation Railway Terminus",
        category: "Rail & Metro",
        status: "Operational",
        description:
          "Major railway junction with direct suburban trains on Harbour & Trans-Harbour lines and outstation terminus for Konkan and nationwide routes.",
        source: "Central Railway (CR)",
        lastVerifiedAt: "2026-07-20",
      },
      {
        id: "inf-panvel-vamc",
        name: "Virar-Alibaug Multi-Modal Corridor (Panvel Section)",
        category: "Highway & Expressways",
        status: "Under construction",
        description:
          "Multi-lane access-controlled transit artery connecting Panvel to Virar, Kalyan, and Alibaug.",
        source: "MSRDC Project Report",
        lastVerifiedAt: "2026-07-10",
      },
    ],
    connectivity: [
      {
        destination: "Navi Mumbai International Airport (NMIA)",
        distanceKm: 7,
        approxTravelTime: "12 mins",
        travelMode: "Drive / Highway",
        route: "Via NH-48 / Airport Arterial",
        lastVerifiedAt: "2026-08-05",
      },
      {
        destination: "Panvel Railway Junction & Metro",
        distanceKm: 3.5,
        approxTravelTime: "8 mins",
        travelMode: "Drive / Highway",
        route: "Via Sion-Panvel Expressway link",
        lastVerifiedAt: "2026-08-05",
      },
      {
        destination: "Atal Setu (MTHL) Interchange (Chirle)",
        distanceKm: 14,
        approxTravelTime: "16 mins",
        travelMode: "Drive / Highway",
        route: "Via JNPT Highway NH-348",
        lastVerifiedAt: "2026-08-05",
      },
      {
        destination: "Pune City Center (via Expressway)",
        distanceKm: 110,
        approxTravelTime: "1 hr 45 mins",
        travelMode: "Drive / Highway",
        route: "Via Mumbai-Pune Expressway",
        lastVerifiedAt: "2026-08-05",
      },
    ],
    buyerConsiderations: [
      {
        title: "Non-Agricultural (NA) & CIDCO Scheme Clearance",
        category: "Title & Documentation",
        description:
          "Ensure plots are strictly sanctioned under CIDCO NAINA town planning schemes or possess Collector Non-Agricultural orders.",
        importance: "Mandatory Due Diligence",
      },
      {
        title: "7/12 Title Search & Mutation Records",
        category: "Title & Documentation",
        description:
          "Conduct a certified 30-year sub-registrar revenue search to ensure zero encumbrance and absolute ownership clarity.",
        importance: "Mandatory Due Diligence",
      },
      {
        title: "MahaRERA Registration Check",
        category: "Regulatory Verification",
        description:
          "Verify the project on the official MahaRERA portal for sanctioned layout maps and developer compliance history.",
        importance: "Regulatory Verification",
      },
      {
        title: "Flood Line & Contour Clearance",
        category: "Access & Infrastructure",
        description:
          "Check topographical contour levels and distance from local river basins to ensure uninhibited monsoon drainage.",
        importance: "Strategic Advantage",
      },
    ],
    marketData: {
      priceRangePerSqYd: "₹38,000 – ₹95,000 / Sq. Yd",
      commercialRangePerSqFt: "₹6,800 – ₹15,000 / Sq. Ft",
      dominantPlotSizes: ["200 Sq. Mtrs", "350 Sq. Mtrs", "500 Sq. Mtrs", "1,000 Sq. Mtrs"],
      activeGrowthCorridors: ["Panvel-NAINA Sectoral Corridors", "Mumbai-Pune Highway Node", "Palaspe Phata Junction"],
      documentationStandard: "CIDCO NAINA Approval & Clear 7/12 Revenue Record",
      sourceNote: "Compiled from CIDCO NAINA scheme disclosures and Panvel sub-registrar transaction data.",
      lastVerifiedAt: "August 2026",
    },
    faq: [
      {
        question: "How does Panvel differ from core Navi Mumbai in plotted land availability?",
        answer:
          "Core Navi Mumbai nodes (Vashi, Nerul, Belapur) are predominantly multi-story apartment developments with limited freehold land. Panvel and the NAINA zone offer extensive master-planned freehold plotted land opportunities backed by CIDCO town planning schemes.",
      },
      {
        question: "What is the expected connectivity advantage once NMIA is operational?",
        answer:
          "Panvel is the closest metropolitan transit hub to NMIA, allowing residents and business owners to reach international passenger and cargo terminals in under 15 minutes.",
      },
    ],
    lastVerifiedAt: "2026-08-15",
  },
  {
    id: "loc-bhiwadi",
    slug: "bhiwadi",
    name: "Bhiwadi",
    state: "Rajasthan / NCR",
    region: "Delhi-Mumbai Industrial Corridor (DMIC) Belt",
    tagline: "Heavy logistics, manufacturing, and commercial corridor adjoining Gurgaon",
    shortDescription:
      "Strategic industrial and logistics powerhouse located on the NH-48 Delhi-Jaipur highway, adjacent to Dharuhera and Gurgaon along the DMIC freight corridor.",
    longDescription:
      "Bhiwadi is one of India's most established industrial and commercial logistics powerhouses, strategically located in the NCR boundary along the NH-48 expressway. Administered under RIICO (Rajasthan State Industrial Development and Investment Corporation) and the NCR Planning Board, Bhiwadi houses thousands of multinational manufacturing and logistics enterprises (Honda, Saint-Gobain, Havells, BKT). It offers institutional commercial plots, logistics land, and township developments with exceptional highway transit to Gurgaon and Delhi.",
    heroImage: "/images/locations/bhiwadi.jpg",
    coordinates: {
      latitude: 28.2102,
      longitude: 76.8606,
    },
    featured: true,
    propertyTypes: ["Commercial Plots", "Industrial Land", "Warehouse Logistics Parcels"],
    microMarkets: [
      {
        id: "mm-bhiwadi-dmic",
        name: "DMIC Freight & Logistics Hub",
        tagline: "Dedicated industrial corridor on Western Freight Axis",
        description:
          "High-capacity industrial and commercial parcels with high-tension power, wide container roads, and direct access to the Delhi-Mumbai Dedicated Freight Corridor.",
        propertyTypes: ["Industrial Land", "Commercial Plots"],
        connectivityContext: "15 minutes to Rewari Inland Container Depot (ICD) and NH-48.",
        highlights: [
          "Direct linkage to Delhi-Mumbai Industrial Corridor (DMIC)",
          "Industrial 3-phase power, water, and statutory zoning clearances",
          "High institutional lease yields and heavy vehicle logistics access",
        ],
        regulatoryAuthority: "RIICO / Statutory Industrial Zone",
        relevantPropertySlugs: ["dmic-industrial-commercial-logistics-bhiwadi"],
      },
      {
        id: "mm-bhiwadi-alwar-bypass",
        name: "Alwar Bypass & Commercial Strip",
        tagline: "Mixed-use commercial and residential growth spine",
        description:
          "The main urban spine of Bhiwadi housing retail complexes, corporate hotels, banking facilities, and residential worker townships.",
        propertyTypes: ["Commercial Plots", "Residential Plots"],
        connectivityContext: "Direct 4-lane link between NH-48 Dharuhera junction and Bhiwadi town.",
        highlights: [
          "Thriving retail and commercial footfall from industrial workforce",
          "Close proximity to Gurgaon / Manesar industrial corridor",
          "High rental demand for residential and commercial units",
        ],
        regulatoryAuthority: "Bhiwadi Urban Improvement Trust (UIT) / RIICO",
        relevantPropertySlugs: ["dmic-industrial-commercial-logistics-bhiwadi"],
      },
    ],
    infrastructure: [
      {
        id: "inf-bhiwadi-dmic",
        name: "Delhi-Mumbai Industrial Corridor (DMIC) Freight Alignment",
        category: "Industrial & Logistics",
        status: "Operational",
        description:
          "Dedicated freight and industrial corridor infrastructure linking Bhiwadi directly to western container ports and northern consumer markets.",
        source: "National Industrial Corridor Development Corporation (NICDC)",
        sourceUrl: "https://nicdc.in",
        lastVerifiedAt: "2026-07-25",
      },
      {
        id: "inf-bhiwadi-nh48",
        name: "NH-48 Delhi-Gurgaon-Jaipur 8-Lane Expressway",
        category: "Highway & Expressways",
        status: "Operational",
        description:
          "Primary vehicular and freight lifeline connecting Bhiwadi to Cyber City Gurgaon (~40 mins) and IGI Airport Delhi (~55 mins).",
        source: "National Highways Authority of India (NHAI)",
        sourceUrl: "https://nhai.gov.in",
        lastVerifiedAt: "2026-08-01",
      },
      {
        id: "inf-bhiwadi-rrts",
        name: "Delhi-Gurgaon-SNB-Alwar RRTS Rapid Rail",
        category: "Rail & Metro",
        status: "Approved",
        description:
          "106-km high-speed regional rail transit line with designated station at Bhiwadi / Dharuhera node, currently in pre-construction and utility diversion phase.",
        source: "National Capital Region Transport Corporation (NCRTC)",
        sourceUrl: "https://ncrtc.in",
        lastVerifiedAt: "2026-07-15",
      },
    ],
    connectivity: [
      {
        destination: "Gurgaon / Cyber City Expressway Node",
        distanceKm: 42,
        approxTravelTime: "40 mins",
        travelMode: "Drive / Highway",
        route: "Via NH-48 Highway",
        lastVerifiedAt: "2026-08-01",
      },
      {
        destination: "Indira Gandhi International Airport (DEL)",
        distanceKm: 58,
        approxTravelTime: "55 mins",
        travelMode: "Drive / Highway",
        route: "Via NH-48 / Dwarka Expressway",
        lastVerifiedAt: "2026-08-01",
      },
      {
        destination: "Rewari Inland Container Depot (ICD)",
        distanceKm: 26,
        approxTravelTime: "28 mins",
        travelMode: "Drive / Highway",
        route: "Via SH-25 Freight Corridor",
        lastVerifiedAt: "2026-08-01",
      },
      {
        destination: "Manesar IMT Industrial Belt",
        distanceKm: 28,
        approxTravelTime: "25 mins",
        travelMode: "Drive / Highway",
        route: "Via NH-48 Highway",
        lastVerifiedAt: "2026-08-01",
      },
    ],
    buyerConsiderations: [
      {
        title: "RIICO Allotment & Leasehold / Freehold Status",
        category: "Title & Documentation",
        description:
          "Verify whether the land parcel is under a 99-year RIICO industrial lease or converted freehold land with registered revenue mutation.",
        importance: "Mandatory Due Diligence",
      },
      {
        title: "Pollution Control Board Clearance (CTE / CTO)",
        category: "Statutory Approvals",
        description:
          "For industrial and logistics setups, check categorisation (Green / Orange / White) and ensure compliance with Rajasthan Pollution Control Board guidelines.",
        importance: "Regulatory Verification",
      },
      {
        title: "High-Tension Power & Water Grid Availability",
        category: "Access & Infrastructure",
        description:
          "Verify the availability of 3-phase industrial power load sanction and industrial water supply lines at plot frontage.",
        importance: "Strategic Advantage",
      },
      {
        title: "Container & Heavy Vehicle Approach Width",
        category: "Access & Infrastructure",
        description:
          "Confirm minimum 60ft or 100ft road access to accommodate multi-axle trailers without internal turning radius restrictions.",
        importance: "Strategic Advantage",
      },
    ],
    marketData: {
      priceRangePerSqYd: "₹16,000 – ₹38,000 / Sq. Yd",
      commercialRangePerSqFt: "₹2,800 – ₹6,200 / Sq. Ft",
      dominantPlotSizes: ["500 Sq. Yds", "1,000 Sq. Yds", "2,500 Sq. Yds", "1 Acre+"],
      activeGrowthCorridors: ["DMIC Freight Axis", "Alwar Bypass Corridor", "RIICO Industrial Phases"],
      documentationStandard: "RIICO / UIT Sanction & Clear Title Revenue Deed",
      sourceNote: "Compiled from RIICO industrial allotment registers and sub-registrar transaction archives.",
      lastVerifiedAt: "August 2026",
    },
    faq: [
      {
        question: "Why is Bhiwadi considered a strategic logistics hub for NCR?",
        answer:
          "Bhiwadi sits directly on the NH-48 expressway and DMIC freight corridor, just 40 minutes from Gurgaon. It offers significantly lower land costs compared to Haryana while providing direct access to North India's largest consumer markets.",
      },
      {
        question: "What types of land parcels are available in Bhiwadi?",
        answer:
          "Bhiwadi offers RIICO-sanctioned industrial plots, highway commercial showrooms, warehousing and logistics land parcels, and plotted residential townships for corporate housing.",
      },
    ],
    lastVerifiedAt: "2026-08-15",
  },
];

// Data accessor and helper utilities
export function getAllLocations(): Location[] {
  return locations;
}

export function getLocationBySlug(slug: string): Location | undefined {
  return locations.find((l) => l.slug.toLowerCase() === slug.toLowerCase());
}

export function getLocationsByState(state: string): Location[] {
  return locations.filter((l) => l.state.toLowerCase().includes(state.toLowerCase()));
}

export function getPropertiesForLocation(locationName: string) {
  const normalized = locationName.toLowerCase().trim();
  return properties.filter((prop) => {
    const cityMatch = prop.city.toLowerCase().trim() === normalized;
    const locationFieldMatch = prop.location.toLowerCase().includes(normalized);
    // Special handling for Panvel / Navi Mumbai cross-linking
    const panvelNaviMumbaiMatch =
      (normalized === "panvel" && prop.city.toLowerCase().includes("navi mumbai")) ||
      (normalized === "navi mumbai" && prop.location.toLowerCase().includes("panvel"));
    return cityMatch || locationFieldMatch || panvelNaviMumbaiMatch;
  });
}

export function getLocationSummaryStats(location: Location) {
  const matchedProperties = getPropertiesForLocation(location.name);
  const propertyCount = matchedProperties.length;
  const propertyTypes = Array.from(new Set(matchedProperties.map((p) => p.propertyType)));

  return {
    propertyCount,
    propertyTypes: propertyTypes.length > 0 ? propertyTypes : location.propertyTypes,
    hasActiveProperties: propertyCount > 0,
  };
}
