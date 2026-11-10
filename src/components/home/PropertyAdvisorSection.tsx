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

/* Bento card: the site's white story-card surface. */
const card =
  "rounded-[26px] border border-[rgba(7,29,45,0.08)] bg-white shadow-[0_14px_35px_rgba(7,29,45,0.06)]";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087fc3]";

export function PropertyAdvisorSection() {
  const whatsappUrl = `https://wa.me/919929533436?text=${encodeURIComponent(
    "Hello Suresh, I would like to discuss a property opportunity."
  )}`;

  return (
    <Reveal>
      <section
        id="property-advisor"
        aria-labelledby="advisor-heading"
        className="w-[calc(100%-32px)] sm:w-[calc(100%-48px)] max-w-[1300px] mx-auto py-10 sm:py-16 lg:py-20"
      >
        {/*
          Bento grid. Row 1-2: photo (tall) beside intro + credentials. Row 3: contact strip.
          Grid items stretch, so cards sharing a row are always the same height.
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          {/* Photo card: spans both rows, fills whatever height the right column needs */}
          <figure
            className={`${card} relative m-0 overflow-hidden lg:col-span-5 lg:row-span-2 aspect-[4/5] sm:aspect-[5/4] lg:aspect-auto min-h-[360px]`}
          >
            <Image
              src={PORTRAIT_SRC}
              alt={`${advisorData.name}, ${advisorData.designation} at ${advisorData.company}`}
              fill
              sizes="(max-width: 1024px) 100vw, 520px"
              quality={85}
              className="object-cover object-top"
            />
            <figcaption className="floating-badge">
              <i>
                <ShieldCheck size={18} />
              </i>
              <span>
                <strong>{advisorData.name}</strong>
                <small>{advisorData.designation}</small>
              </span>
            </figcaption>
          </figure>

          {/* Intro card */}
          <div className={`${card} lg:col-span-7 p-6 sm:p-9 flex flex-col justify-center`}>
            <p className="eyebrow">Your property advisor</p>
            <h2
              id="advisor-heading"
              className="mt-3 font-instrument font-normal text-[#071a28] leading-[1.04] tracking-tight text-[2.2rem] xs:text-[2.5rem] sm:text-[3rem] xl:text-[3.6rem]"
            >
              Property guidance,
              <br className="hidden sm:inline" /> shaped around you.
            </h2>
            <p className="mt-4 max-w-[34rem] text-[.95rem] sm:text-base leading-[1.7] text-[#4a5568]">
              Every enquiry is handled one-on-one by {advisorData.name}, from the first conversation
              to the final registry. Titles are verified, corridor valuations are genuine, and
              nothing is hidden from you.
            </p>
          </div>

          {/* Credentials card */}
          <div className={`${card} lg:col-span-7 p-6 sm:p-9`}>
            <h3 className="text-[.82rem] font-semibold text-[#071a28]">Credentials</h3>
            <dl className="mt-2">
              {ledger.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-[minmax(0,9.5rem)_1fr] sm:grid-cols-[12rem_1fr] gap-4 py-3 ${
                    i === 0 ? "" : "border-t border-[rgba(7,26,40,0.07)]"
                  }`}
                >
                  <dt className="text-[.86rem] text-[#566773]">{row.label}</dt>
                  <dd className="text-[.92rem] font-semibold text-[#071a28] tabular-nums">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Contact strip: dark card, same navy as the hero and closing banner */}
          <div
            className="lg:col-span-12 relative overflow-hidden rounded-[26px] bg-[#071a28] text-white p-6 sm:p-9
                       bg-[linear-gradient(rgba(66,183,232,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(66,183,232,.05)_1px,transparent_1px)] bg-[size:35px_35px]
                       shadow-[0_30px_74px_rgba(7,26,40,0.18)] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
          >
            <div>
              <p className="text-[.82rem] font-semibold text-white/70">
                Speak to {advisorData.name.split(" ")[0]} directly
              </p>
              <a
                href={`tel:${advisorData.phoneRaw}`}
                className={`mt-1 inline-block font-instrument text-[2.2rem] sm:text-[3rem] leading-tight text-white hover:text-[#42b7e8] transition-colors rounded ${focusRing}`}
              >
                {advisorData.phone}
              </a>
              <p className="mt-1 text-[.78rem] text-white/60">
                Free and confidential. Office hours {siteConfig.contact.officeHours}.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
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
              <a href={`mailto:${advisorData.email}`} className={`button-ghost ${focusRing}`}>
                <Mail size={16} aria-hidden="true" />
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
