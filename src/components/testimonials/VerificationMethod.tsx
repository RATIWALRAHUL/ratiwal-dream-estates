import { ShieldCheck, FileCheck, Lock, EyeOff, UserCheck, Scale } from "lucide-react";

export function VerificationMethod() {
  const standards = [
    {
      icon: UserCheck,
      title: "Documented Client Authorization",
      description:
        "Every client story, quote, and case study is published only after obtaining written or digital consent from the buyer or investor.",
    },
    {
      icon: EyeOff,
      title: "Strict Privacy & Anonymity Controls",
      description:
        "Clients can choose full anonymity, initials, or professional descriptors (e.g., 'NRI Property Buyer'). Personal contact info is never displayed.",
    },
    {
      icon: FileCheck,
      title: "Substantiated Transaction Records",
      description:
        "The 'Verified Client Story' badge is granted only when our compliance team confirms the review matches a registered transaction or advisory engagement.",
    },
    {
      icon: Lock,
      title: "Confidentiality of Financials",
      description:
        "We strictly omit sensitive purchase amounts, private bank details, loan particulars, and exact residential plot numbers to safeguard client security.",
    },
    {
      icon: Scale,
      title: "Zero Fabricated Reviews",
      description:
        "We do not purchase fake online reviews, use AI-generated portraits, or invent speculative appreciation percentages.",
    },
    {
      icon: ShieldCheck,
      title: "Ongoing Consent Management",
      description:
        "Clients may amend their consent scope or request removal of their story at any time by contacting our compliance desk.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white border-b border-[rgba(7,26,40,0.08)]" aria-labelledby="verification-method-heading">
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & Context */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(36,209,127,0.1)] border border-[rgba(36,209,127,0.25)] text-[#10854d] text-xs font-bold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Transparency Standards</span>
            </div>
            <h2
              id="verification-method-heading"
              className="font-heading text-3xl sm:text-4xl text-[#031C2B] font-normal leading-tight tracking-tight mb-4"
            >
              How we publish <br />client stories.
            </h2>
            <p className="text-sm sm:text-base text-[#4a6171] leading-relaxed mb-6">
              Our reputation is built on authentic advisory relationships. We hold client stories to the highest ethical and privacy standards, ensuring genuine transparency without compromising client confidentiality.
            </p>
            <div className="p-4 rounded-xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.08)] text-xs text-[#2c3e50] leading-relaxed">
              <strong className="text-[#031C2B] block mb-1">Our Verification Guarantee:</strong>
              “Verified means Ratiwal Dream Estates has confirmed the review is connected to a genuine client interaction, statutory masterplan consultation, or land acquisition record.”
            </div>
          </div>

          {/* Right Column: Standards Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {standards.map((std, i) => {
              const Icon = std.icon;
              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.07)] flex flex-col justify-between"
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-[rgba(7,26,40,0.08)] flex items-center justify-center text-[#0784C8] mb-3 shadow-xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-heading text-sm font-bold text-[#031C2B] mb-1.5">
                    {std.title}
                  </h3>
                  <p className="text-xs text-[#536574] leading-relaxed">
                    {std.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
