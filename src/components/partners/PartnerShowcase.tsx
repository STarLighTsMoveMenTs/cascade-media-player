import { useState } from "react";
import { locations } from "@/components/globe/HologramScene";
import { getLogoUrl } from "@/lib/logoDev";
import { Search, Globe, Building2 } from "lucide-react";

export const PartnerShowcase = () => {
  const [filter, setFilter] = useState("");
  const [category, setCategory] = useState<"all" | "tech" | "gov" | "un" | "eu" | "corp" | "hnoss">("all");

  // Simple keyword-based categorization
  const getCategory = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("statesflow") || n.includes("valuesky") || n.includes("heftling") || n.includes("starlights") || n.includes("churchpattern") || n.includes("gardiensystem") || n.includes("moonschlee") || n.includes("pfihpeacust") || n.includes("pathwinding") || n.includes("phmegtishen") || n.includes("flykniwnie") || n.includes("dfffoesssooooassso")) return "hnoss";
    if (n.includes("un") || n.includes("wipo") || n.includes("who") || n.includes("wto") || n.includes("unesco") || n.includes("unicef") || n.includes("unep") || n.includes("unctad") || n.includes("habitat") || n.includes("compact") || n.includes("red cross") || n.includes("world bank") || n.includes("imf")) return "un";
    if (n.includes("european") || n.includes("eu") || n.includes("council of the") || n.includes("nato") || n.includes("oecd") || n.includes(" interpol") || n.includes("opec") || n.includes("asean") || n.includes("african union") || n.includes("g7") || n.includes("g20") || n.includes("world economic")) return "eu";
    if (n.includes("microsoft") || n.includes("google") || n.includes("intel") || n.includes("aws") || n.includes("amazon") || n.includes("ibm") || n.includes("github") || n.includes("openai") || n.includes("arm") || n.includes("linux") || n.includes("openssf") || n.includes("auth0") || n.includes("frontegg") || n.includes("samsung") || n.includes("sony") || n.includes("ericsson") || n.includes("nokia") || n.includes("apple") || n.includes("nvidia") || n.includes("tesla") || n.includes("meta") || n.includes("alphabet") || n.includes("oracle") || n.includes("salesforce") || n.includes("adobe") || n.includes("netflix") || n.includes("paypal") || n.includes("uber") || n.includes("airbnb") || n.includes("linkedin") || n.includes("zoom") || n.includes("shopify") || n.includes("stripe") || n.includes("coinbase") || n.includes("cloudflare") || n.includes("datadog") || n.includes("atlassian") || n.includes("wise") || n.includes("monzo") || n.includes("figma") || n.includes("vercel") || n.includes("cisco") || n.includes("dell") || n.includes("hp") || n.includes("lenovo") || n.includes("amd") || n.includes("qualcomm") || n.includes("broadcom") || n.includes("micron") || n.includes("tsmc") || n.includes("asml") || n.includes("infineon") || n.includes("nxp") || n.includes("stmicroelectronics") || n.includes("renesas") || n.includes("mediatek") || n.includes("grab") || n.includes("goto") || n.includes("sea limited") || n.includes("rakuten") || n.includes("softbank") || n.includes("panasonic") || n.includes("hitachi")) return "tech";
    if (n.includes("shell") || n.includes("siemens") || n.includes("bosch") || n.includes("sap") || n.includes("airbus") || n.includes("bayer") || n.includes("basf") || n.includes("allianz") || n.includes("deutsche bank") || n.includes("lufthansa") || n.includes("adidas") || n.includes("puma") || n.includes("spotify") || n.includes("toyota") || n.includes("volkswagen") || n.includes("mercedes") || n.includes("bmw") || n.includes("honda") || n.includes("hyundai") || n.includes("general motors") || n.includes("ford") || n.includes("stellantis") || n.includes("ferrari") || n.includes("porsche") || n.includes("audi") || n.includes("volvo") || n.includes("jaguar") || n.includes("aston martin") || n.includes("mclaren") || n.includes("rolls-royce") || n.includes("bentley") || n.includes("jpmorgan") || n.includes("bank of america") || n.includes("citigroup") || n.includes("goldman") || n.includes("morgan stanley") || n.includes("wells fargo") || n.includes("hsbc") || n.includes("barclays") || n.includes("standard chartered") || n.includes("ubs") || n.includes("credit suisse") || n.includes("bnp") || n.includes("société générale") || n.includes("crédit agricole") || n.includes("ing group") || n.includes("exxonmobil") || n.includes("chevron") || n.includes("bp") || n.includes("totalenergies") || n.includes("equinor") || n.includes("eni") || n.includes("saudi aramco") || n.includes("petrobras") || n.includes("schlumberger") || n.includes("halliburton") || n.includes("johnson") || n.includes("pfizer") || n.includes("roche") || n.includes("novartis") || n.includes("merck") || n.includes("sanofi") || n.includes("astrazeneca") || n.includes("glaxo") || n.includes("eli lilly") || n.includes("abbvie") || n.includes("medtronic") || n.includes("philips") || n.includes("siemens healthineers") || n.includes("verizon") || n.includes("at&t") || n.includes("t-mobile") || n.includes("china mobile") || n.includes("deutsche telekom") || n.includes("telefónica") || n.includes("orange") || n.includes("vodafone") || n.includes("telstra") || n.includes("singtel") || n.includes("lockheed") || n.includes("boeing") || n.includes("raytheon") || n.includes("northrop") || n.includes("general dynamics") || n.includes("bae systems") || n.includes("thales") || n.includes("safran") || n.includes("leonardo") || n.includes("dassault") || n.includes("mckinsey") || n.includes("boston consulting") || n.includes("bain") || n.includes("accenture") || n.includes("deloitte") || n.includes("pwc") || n.includes("ey") || n.includes("kpmg") || n.includes("capgemini") || n.includes("infosys") || n.includes("tcs") || n.includes("wipro") || n.includes("siemens energy") || n.includes("abb") || n.includes("schneider electric") || n.includes("danfoss")) return "corp";
    return "gov";
  };

  const filtered = locations.filter((loc) => {
    const matchesSearch =
      filter === "" ||
      loc.name.toLowerCase().includes(filter.toLowerCase()) ||
      loc.city.toLowerCase().includes(filter.toLowerCase()) ||
      loc.country.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = category === "all" || getCategory(loc.name) === category;
    return matchesSearch && matchesCategory;
  });

  const cats: { key: typeof category; label: string; icon: typeof Globe }[] = [
    { key: "all", label: "All Partners", icon: Globe },
    { key: "tech", label: "Technology", icon: Building2 },
    { key: "corp", label: "Corporations", icon: Building2 },
    { key: "eu", label: "International", icon: Globe },
    { key: "un", label: "Global Orgs", icon: Globe },
    { key: "gov", label: "Government", icon: Building2 },
    { key: "hnoss", label: "HNOSS", icon: Globe },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-cyan-300 tracking-wider mb-4">
          GLOBAL PARTNER NETWORK
        </h2>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search partners..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-cyan-500/30 rounded text-cyan-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {cats.map((c) => {
              const Icon = c.icon;
              const active = category === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={`px-3 py-2 rounded text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                    active
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                      : "bg-slate-900/60 border-slate-600 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Partner Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((loc, i) => {
          const logo = getLogoUrl(loc.domain, { size: 64, retina: true });
          return (
            <div
              key={i}
              className="group relative bg-slate-900/70 border border-white/10 hover:border-cyan-500/40 rounded-lg p-4 backdrop-blur-sm transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:-translate-y-0.5"
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-cyan-400/60 rounded-tl-sm"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-cyan-400/60 rounded-tr-sm"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-cyan-400/60 rounded-bl-sm"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-cyan-400/60 rounded-br-sm"></div>

              <div className="flex items-start gap-3">
                {/* Logo */}
                <div className="shrink-0 w-12 h-12 rounded bg-white/90 flex items-center justify-center overflow-hidden">
                  {logo ? (
                    <img
                      src={logo}
                      alt={`${loc.name} logo`}
                      className="w-10 h-10 object-contain"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-slate-400 text-[10px] font-mono">NO LOGO</span>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-cyan-200 font-bold text-sm truncate leading-tight">
                    {loc.name}
                  </h3>
                  <p className="text-slate-400 text-[10px] mt-1 truncate">
                    {loc.city}, {loc.country}
                  </p>
                  <p className="text-slate-500 text-[10px] mt-0.5 truncate">
                    {loc.ceo}
                  </p>
                </div>
              </div>

              {/* Bottom stats */}
              <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                  {getCategory(loc.name)}
                </span>
                <span className="text-cyan-400 text-xs font-mono font-bold">
                  {loc.data_value}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">
          No partners match your search.
        </div>
      )}

      <div className="mt-4 text-center text-[10px] text-slate-500 font-mono tracking-wider">
        DISPLAYING {filtered.length} / {locations.length} GLOBAL ENTITIES
      </div>
    </div>
  );
};
