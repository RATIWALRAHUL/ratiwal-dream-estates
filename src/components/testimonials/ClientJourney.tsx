import { CheckCircle2, FileSearch, MapPin, Compass, Banknote, ShieldAlert, Scale } from "lucide-react";

export function ClientJourney() {
  const steps = [
    {
      number: "01",
      icon: Compass,
      title: "Requirements Discussion",
      description: "We clarify your primary objective (end-use villa, commercial logistics, or land-banking), plot dimensions, timeline, and location preferences.",
    },
    {
      number: "02",
      icon: MapPin,
      title: "Corridor Shortlisting",
      description: "Screening verified micro-markets across Jaipur, Ajmer, or Navi Mumbai against statutory masterplans and sectoral road connectivity.",
    },
    {
      number: "03",
      icon: FileSearch,
      title: "Masterplan & Document Review",
      description: "Auditing 90A conversion sanctions, JDA/ADA/CIDCO layout approvals, 30-year revenue Jamabandi, and RERA disclosures.",
    },
    {
      number: "04",
      icon: CheckCircle2,
      title: "Site-Visit & Demarcation",
      description: "Conducting physical site inspections, road-width audits (60ft/40ft), and Total Station boundary verification with on-ground experts.",
    },
    {
      number: "05",
      icon: Banknote,
      title: "Commercial Clarification",
      description: "Reviewing transparent market benchmarks, developer terms, stamp duty liabilities, and registry fees with zero hidden markups.",
    },
    {
      number: "06",
      icon: Scale,
      title: "Registry & Mutation Support",
      description: "Liaison through Sub-Registrar deed execution, escrow management, and municipal mutation (Dakhil Kharij) filing.",
    },
    {
      number: "07",
      icon: ShieldAlert,
      title: "Buyer’s Independent Final Decision",
      description: "You review all verified findings at your own pace without high-pressure sales tactics or artificial booking urgency.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-[#F5F1E9] border-b border-[rgba(7,26,40,0.08)]" aria-labelledby="advisory-journey-heading">
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        {/* Header */}
        <div className="max-w-[720px] mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-3">
            <Compass className="w-3.5 h-3.5" aria-hidden="true" />
            <span>The Advisory Experience</span>
          </div>
          <h2
            id="advisory-journey-heading"
            className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] text-[#031C2B] font-normal leading-tight tracking-tight mb-3"
          >
            Support across each stage of the decision.
          </h2>
          <p className="text-sm sm:text-base text-[#4a6171] leading-relaxed">
            Our structured 7-stage advisory framework ensures you evaluate land assets with complete transactional visibility from initial consultation to registered deed.
          </p>
        </div>

        {/* Journey Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_16px_rgba(7,26,40,0.03)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-[#0784C8] bg-[#edf5f9] px-2.5 py-1 rounded-md">
                      Stage {step.number}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#F5F1E9] flex items-center justify-center text-[#031C2B]">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="font-heading text-base font-bold text-[#031C2B] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#536574] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mandatory Independent Legal Disclaimer */}
        <div className="mt-8 p-4 rounded-xl bg-white border border-[rgba(7,26,40,0.08)] flex items-start gap-3">
          <Scale className="w-4 h-4 text-[#0784C8] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#667d8f] leading-relaxed">
            <strong>Advisory Notice:</strong> This framework represents our standard consultation methodology. Final legal, financial, technical, and investment decisions remain strictly with the buyer and their independent professional advisors.
          </p>
        </div>
      </div>
    </section>
  );
}
