import Image from "next/image";
import { Mail, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { advisorData } from "@/data/advisorData";
import { firmStats, siteConfig } from "@/config/site";

/* Official photograph of the advisor (real portrait, no cut-out, no AI imagery). */
const PORTRAIT_SRC = "/images/brand/suresh-kumawat.jpg";

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/** Credentials, in the order a buyer checks them. All figures come from firmStats / advisorData. */
const ledger: { label: string; value: string }[] = [
  { label: "Experience", value: `${firmStats.yearsExperience} years in land advisory` },
  { label: "Families guided", value: firmStats.familiesGuided },
  { label: "Land transacted", value: `${firmStats.sqYardsTransacted} sq. yards` },
  { label: "RERA registration", value: advisorData.rera },
  ...(advisorData.legalName ? [{ label: "Registered name", value: advisorData.legalName }] : []),
];

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087fc3]";

export function PropertyAdvisorSection() {
  const whatsappUrl = `https://wa.me/919929533436?text=${encodeURIComponent(
    "Hello Suresh, I would like to discuss a property opportunity."
  )}`;

  return (
    <Reveal>
      <section id="property-advisor" className="about-section" aria-labelledby="advisor-heading">
        {/* Portrait: same blueprint-panel + glass-badge device as the About section */}
        <div className="about-visual advisor-visual">
          <div className="about-image-wrap">
            <div className="about-image advisor-portrait">
              <Image
                src={PORTRAIT_SRC}
                alt={`${advisorData.name}, ${advisorData.designation} at ${advisorData.company}`}
                fill
                sizes="(max-width: 900px) 90vw, 520px"
                quality={85}
                className="object-cover object-top"
              />
            </div>
            <div className="floating-badge">
              <i>
                <ShieldCheck size={18} />
              </i>
              <span>
                <strong>{advisorData.name}</strong>
                <small>{advisorData.designation}</small>
              </span>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="about-copy">
          <p className="eyebrow">Your property advisor</p>
          <h2 id="advisor-heading">
            Property guidance,
            <br className="hidden sm:inline" /> shaped around you.
          </h2>
          <p>
            Every enquiry is handled one-on-one by {advisorData.name}, from the first conversation
            to the final registry. Titles are verified, corridor valuations are genuine, and nothing
            is hidden from you.
          </p>

          <dl className="mb-7 border-t border-[rgba(7,26,40,0.12)]">
            {ledger.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[minmax(0,9.5rem)_1fr] sm:grid-cols-[11rem_1fr] gap-4 border-b border-[rgba(7,26,40,0.07)] py-3"
              >
                <dt className="text-[.86rem] text-[#566773]">{row.label}</dt>
                <dd className="text-[.92rem] font-semibold text-[#071a28] tabular-nums">{row.value}</dd>
              </div>
            ))}
          </dl>

          {/* Direct contact, in the site's white story-card style */}
          <div className="rounded-[18px] border border-[rgba(7,29,45,0.08)] bg-white p-5 sm:p-6 shadow-[0_14px_35px_rgba(7,29,45,0.06)]">
            <p className="text-[.82rem] font-semibold text-[#071a28]">Speak to {advisorData.name.split(" ")[0]} directly</p>
            <a
              href={`tel:${advisorData.phoneRaw}`}
              className={`mt-1 inline-block font-instrument text-[2rem] sm:text-[2.3rem] leading-tight text-[#071a28] hover:text-[#087fc3] transition-colors rounded ${focusRing}`}
            >
              {advisorData.phone}
            </a>

            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Message ${advisorData.name} on WhatsApp`}
                className={`button-primary ${focusRing}`}
              >
                <WhatsAppIcon className="w-[17px] h-[17px]" />
                <span>WhatsApp</span>
              </a>
              <a
                href={`mailto:${advisorData.email}`}
                className={`inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-[rgba(7,26,40,0.14)] bg-white px-6 text-[.85rem] font-bold text-[#071a28] transition-colors hover:border-[#087fc3] hover:text-[#087fc3] ${focusRing}`}
              >
                <Mail size={16} aria-hidden="true" />
                <span>Email</span>
              </a>
            </div>

            <p className="mt-4 text-[.72rem] text-[#71808d]">
              Free and confidential. Office hours {siteConfig.contact.officeHours}.
            </p>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
