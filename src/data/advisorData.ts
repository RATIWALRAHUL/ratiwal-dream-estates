export interface PropertyAdvisor {
  company: string;
  name: string;
  designation: string;
  role: string;
  phone: string;
  phoneRaw: string;
  email: string;
  rera: string;
  experience: string;
  experienceLabel: string;
  clients: string;
  clientsLabel: string;
  propertySold: string;
  propertySoldLabel: string;
  imageCutout: string;
}

export const advisorData: PropertyAdvisor = {
  company: "Ratiwal Dream Estates",
  name: "Suresh Kumawat",
  designation: "Senior Property Advisor",
  role: "Real Estate Consultant",
  phone: "+91 99295 33436",
  phoneRaw: "+919929533436",
  email: "sureshkumawat6917@gmail.com",
  rera: "RAJ/A/2019/983",
  experience: "8+ Years",
  experienceLabel: "Land Advisory",
  clients: "250+ Families",
  clientsLabel: "Guided",
  propertySold: "50,000+ Sq. Yards",
  propertySoldLabel: "Transacted",
  imageCutout: "/images/brand/suresh-kumawat-cutout.png",
};
