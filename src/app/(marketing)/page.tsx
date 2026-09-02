import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, Check, Clock3, FileCheck2, MapPin, Quote, ShieldCheck, Sparkles, Star } from "lucide-react";
import { getMetadata } from "@/lib/seo";
import { properties } from "@/data/properties";
import { testimonials } from "@/data/testimonials";
import { PropertyCard } from "@/components/property/PropertyCard";
import { HomeSearch } from "@/components/home/HomeSearch";
import { HeroSlider } from "@/components/home/HeroSlider";
import { Reveal } from "@/components/home/Reveal";
import { CountUp } from "@/components/home/CountUp";
import { MagneticButton } from "@/components/home/MagneticButton";
import { PropertyAdvisorSection } from "@/components/home/PropertyAdvisorSection";

export const metadata = getMetadata({
  title: "Premium Plots in Jaipur & Navi Mumbai",
  description:
    "Discover verified residential and commercial plots with Ratiwal Dream Estates, your trusted property consultancy.",
  slug: "",
});

const marqueeItems = [
  { icon: ShieldCheck, label: "Verified Land" },
  { icon: FileCheck2, label: "Clear Documentation" },
  { icon: MapPin, label: "Local Expertise" },
  { icon: Clock3, label: "10+ Years Experience" },
  { icon: Building2, label: "500+ Verified Projects" },
  { icon: Sparkles, label: "100% Transparency Always" },
];

export default function HomePage() {
  const featured = properties.filter((property) => property.featured);

  return (
    <>
      <HeroSlider />
    <HomeSearch properties={properties}/>
    <div className="proof-marquee" aria-hidden="true"><div className="marquee-track">{[...marqueeItems, ...marqueeItems].map((item, index) => <span className="marquee-item" key={index}><item.icon size={16} strokeWidth={1.5}/>{item.label}<i/></span>)}</div></div>
    <section className="section-wrap editorial-properties" id="featured" aria-labelledby="featured-title">
      <Reveal><div className="section-heading-row"><div><p className="eyebrow">Handpicked opportunities</p><h2 id="featured-title">Properties selected<br className="hidden sm:inline"/> with purpose.</h2><i aria-hidden="true"/></div><Link href="/properties" className="text-link">View all properties <ArrowRight size={17}/></Link></div></Reveal>
      <Reveal className="property-grid editorial-grid reveal-stagger">{featured.map((property)=><PropertyCard property={property} key={property.id}/>)}</Reveal>
    </section>
    <Reveal><section className="about-section" aria-labelledby="about-title"><div className="about-copy"><p className="eyebrow">About Ratiwal Dream Estates</p><h2 id="about-title">Property decisions,<br className="hidden sm:inline"/> made with clarity.</h2><p>We help buyers and investors discover verified land opportunities across Rajasthan and Maharashtra. Every recommendation is guided by transparency, documentation, and a long-term view.</p><ul className="trust-list"><li><Check/><span>Clear, honest consultation</span></li><li><Check/><span>Carefully evaluated opportunities</span></li><li><Check/><span>Support from discovery to documentation</span></li><li><Check/><span>End-to-end assistance and legal support</span></li></ul><MagneticButton><Link href="/about" className="button-primary">Learn more about us <ArrowRight size={17}/></Link></MagneticButton></div><div className="about-visual"><div className="about-image"><Image src="/images/placeholders/insight-placeholder.jpg" alt="Architectural plans under professional review" fill sizes="(max-width: 768px) 100vw, 50vw" quality={85} loading="lazy" className="object-cover"/></div><div className="floating-badge"><i><ShieldCheck size={18}/></i><span><strong>Verified &amp; Transparent</strong><small>Every opportunity reviewed</small></span></div><div className="metrics"><span><strong><CountUp end={10} suffix="+"/></strong><small>Years of<br/>Experience</small></span><span><strong><CountUp end={1} decimals={0} suffix="K+"/></strong><small>Happy<br/>Clients</small></span><span><strong><CountUp end={500} suffix="+"/></strong><small>Verified<br/>Projects</small></span><span><strong><CountUp end={100} suffix="%"/></strong><small>Transparency<br/>Always</small></span></div></div></section></Reveal>
    <PropertyAdvisorSection />
    <Reveal>
      <section className="testimonials-section editorial-testimonials" aria-labelledby="testimonials-title">
        <div className="client-story-feature">
          <div className="client-heading">
            <p className="eyebrow">Client stories</p>
            <h2 id="testimonials-title">Trusted through<br className="hidden sm:inline"/> every step.</h2>
            <Link href="/testimonials" className="text-link mt-2.5 mb-5 sm:mb-0 inline-flex items-center gap-1.5 text-xs font-bold text-[#0784C8] hover:underline">
              <span>Read all client stories</span>
              <ArrowRight size={15} />
            </Link>
          </div>
          {testimonials[0] && (
            <article className="story-card story-featured">
              <Quote className="story-quote" aria-hidden="true"/>
              <div className="stars" aria-label={`${testimonials[0].rating || 5} out of 5 stars`}>
                {Array.from({ length: testimonials[0].rating || 5 }, (_, index) => (
                  <Star key={index} fill="currentColor" />
                ))}
              </div>
              <p>“{testimonials[0].quote}”</p>
              <div className="story-person">
                <span>{testimonials[0].clientDisplayName.charAt(0)}</span>
                <div>
                  <strong>{testimonials[0].clientDisplayName}</strong>
                  <small>{testimonials[0].clientType || `${testimonials[0].city}, ${testimonials[0].state}`}</small>
                </div>
              </div>
            </article>
          )}
        </div>
        <div className="story-stack">
          {testimonials.slice(1, 3).map((item) => (
            <article className="story-card" key={item.id}>
              <Quote className="story-quote" aria-hidden="true"/>
              <div className="stars" aria-label={`${item.rating || 5} out of 5 stars`}>
                {Array.from({ length: item.rating || 5 }, (_, index) => (
                  <Star key={index} fill="currentColor" />
                ))}
              </div>
              <p>“{item.quote}”</p>
              <div className="story-person">
                <span>{item.clientDisplayName.charAt(0)}</span>
                <div>
                  <strong>{item.clientDisplayName}</strong>
                  <small>{item.clientType || `${item.city}, ${item.state}`}</small>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </Reveal>
    <Reveal><section className="prefooter-cta grain" aria-labelledby="cta-title"><Image src="/images/placeholders/property-placeholder.jpg" alt="Premium plotted residential avenue at twilight" fill sizes="100vw" className="object-cover"/><div className="prefooter-overlay"/><div><p className="eyebrow">Start with a conversation</p><h2 id="cta-title">Ready to find the<br className="hidden sm:inline"/> right property?</h2><p>Speak with our advisors and discover verified opportunities that fit your goals.</p><MagneticButton><Link href="/contact" className="newsletter-button">Start a conversation <ArrowRight size={17}/></Link></MagneticButton></div></section></Reveal>
    </>
  );
}
