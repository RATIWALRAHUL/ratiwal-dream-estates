import Image from "next/image";
import Link from "next/link";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { navigationConfig } from "@/config/navigation";

export default function Footer() {
  return <footer className="premium-footer" aria-label="Site footer"><div className="footer-grid">
    <div className="footer-brand"><Link href="/"><Image src="/images/brand/ratiwal-logo.svg" alt="Ratiwal Dream Estates" width={185} height={74}/></Link><p>{siteConfig.tagline}</p><div className="footer-social"><a href={siteConfig.social.instagram} aria-label="Instagram"><Globe/></a><a href={siteConfig.social.linkedin} aria-label="LinkedIn"><Globe/></a></div></div>
    <div><h2>Company</h2><ul>{navigationConfig.footerNav.company.map((link)=><li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}</ul></div>
    <div><h2>Properties</h2><ul>{navigationConfig.footerNav.properties.map((link)=><li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}</ul></div>
    <div><h2>Contact</h2><ul className="footer-contact"><li><Phone/>{siteConfig.contact.phone}</li><li><Mail/>{siteConfig.contact.email}</li><li><MapPin/>{siteConfig.contact.address}</li></ul></div>
  </div><div className="footer-bottom"><p>© {new Date().getFullYear()} Ratiwal Dream Estates. All rights reserved.</p><div>{navigationConfig.footerNav.support.map((link)=><Link href={link.href} key={link.href}>{link.label}</Link>)}<Link href="/sitemap.xml">Sitemap</Link></div></div></footer>;
}
