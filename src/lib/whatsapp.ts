import { siteConfig } from "@/config/site";

export function getWhatsAppNumber(): string {
  const phone = siteConfig.contact.whatsapp;
  if (!phone || phone.includes("[CONTENT REQUIRED]")) {
    return "";
  }
  // Remove non-numeric characters for wa.me link
  return phone.replace(/[^\d]/g, "");
}

interface WhatsAppUrlOptions {
  type: "general" | "property" | "location";
  propertyName?: string;
  locationName?: string;
}

export function generateWhatsAppMessage({
  type,
  propertyName,
  locationName,
}: WhatsAppUrlOptions): string {
  const base = "Hello Ratiwal Dream Estates, ";
  
  if (type === "property" && propertyName) {
    const locText = locationName ? ` in ${locationName}` : "";
    return `${base}I would like to know more about ${propertyName}${locText}.`;
  }
  
  if (type === "location" && locationName) {
    return `${base}I would like to know more about property options in ${locationName}.`;
  }
  
  return `${base}I would like to consult with an expert regarding plot investments.`;
}

export function generateWhatsAppUrl(options: WhatsAppUrlOptions): string {
  const cleanNumber = getWhatsAppNumber();
  if (!cleanNumber) {
    return "#";
  }
  const messageText = generateWhatsAppMessage(options);
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;
}
