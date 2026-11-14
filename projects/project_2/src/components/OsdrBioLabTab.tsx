import React, { useState } from "react";
import { CheckCircle2, Dna, ExternalLink, FlaskConical, Search } from "lucide-react";
import { searchLiveOsdrStudies } from "../services/nasaTelemetryService";
import type { OsdrStudyRecord } from "../types/mission";

interface OsdrBioLabTabProps {
  readonly studies: readonly OsdrStudyRecord[];
  readonly activeOsdId: string;
  readonly onSelectStudy: (osdId: string) => void;
}

const QUIZ_QUESTIONS = [
  {
    id: "q1",
    prompt:
      "Based on NASA OSDR studies OSD-109 and OSD-117, which particle species drives stronger long-lasting cardiac stress even at lower absorbed dose (15 cGy vs 90 cGy)?",
    options: [
      "1 GeV/n high-LET Iron (56Fe) HZE cosmic rays",
      "Visible optical sunlight through cupola glass",
      "Thermal cabin nitrogen recirculation",
    ],
    correctIndex: 0,
    explanation:
      "Correct: OSD-109 and OSD-117 show high-LET 56Fe ions activate p38 MAPK, NFATc4, and NF-kB pathways far more strongly than 90 cGy protons.",
  },
  {
    id: "q2",
    prompt:
      "During a sudden solar proton surge (1H >= 50 pfu), why does wiring [Water-Wall Shield] alongside [Seal Storm Shelter] dramatically cut dose?",
    options: [
      "Hydrogen-rich water walls efficiently slow down solar protons (HZE shielding needs complementary bio countermeasures)",
      "Water pumps spin up atmospheric oxygen turbines",
      "Water conducts solar X-rays into the greenhouse",
    ],
    correctIndex: 0,
    explanation:
      "Correct: Hydrogen atoms in water and polyethylene absorb solar protons effectively without producing heavy secondary fragmentation.",
  },
  {
    id: "q3",
    prompt:
      "What did NASA OSDR OSD-714 (MARS artificial gravity centrifuge) discover about Lunar 1/6 g partial gravity?",
    options: [
      "1/6 g prevents skeletal muscle atrophy proteostasis loss, though higher gravity or exercise is needed for myofiber shift",
      "1/6 g instantly stops all cosmic radiation hits",
      "Lunar gravity destroys hydroponics germination",
    ],
    correctIndex: 0,
    explanation:
      "Correct: OSD-714 proved lunar 1/6 g maintains soleus proteostasis while myofiber slow-to-fast shift requires targeted countermeasure loading.",
  },
];

export const OsdrBioLabTab: React.FC<OsdrBioLabTabProps> = ({
  studies,
  activeOsdId,
  onSelectStudy,
}) => {
  const [searchQuery, setSearchQuery] = useState("radiation");
  const [searching, setSearching] = useState(false);
  const [searchHits, setSearchHits] = useState<{
    total: number;
    titles: { accession: string; title: string }[];
    source: "live" | "cached";
  } | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    const result = await searchLiveOsdrStudies(searchQuery);
    setSearchHits(result);
    setSearching(false);
  };

  const correctCount = QUIZ_QUESTIONS.filter(
    (q) => answers[q.id] === q.correctIndex
  ).length;

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3 sm:gap-4 sm:p-4">
      <div className="hud-panel flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4">
        <div className="min-w-0 space-y-1">
          <div className="hud-panel-title flex items-center gap-2">
            <Dna size={14} className="shrink-0" />
            <span>NASA OSDR RADIOBIOLOGY & COUNTERMEASURE LAB</span>
          </div>
          <p className="max-w-3xl text-xs text-[#c7c5b2]">
            Explore verified NASA Open Science Data Repository (OSDR) studies powering the simulation&apos;s biological stress index. Apply any study profile to calibrate your OSDR Bio Monitor flow block.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 border border-[rgba(250,250,229,0.24)] bg-[#050302] px-2.5 py-1.5 sm:flex-none">
            <Search size={13} className="shrink-0 text-[#8d8b7a]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search live OSDR (radiation, lunar...)"
              className="mono w-full min-w-0 bg-transparent text-xs text-[#fafae5] outline-none sm:w-56"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="hud-btn hud-btn--primary shrink-0"
          >
            {searching ? "Querying..." : "Query OSDR API"}
          </button>
        </form>
      </div>

      {searchHits ? (
        <div className="hud-panel border-[#c084fc] p-3">
          <div className="mono mb-2 text-[11px] font-bold text-[#c084fc]">
            {searchHits.source === "live"
              ? `LIVE NASA OSDR API RESULTS (${searchHits.total} TOTAL MATCHED RECORDS)`
              : `CACHED VERIFIED OSDR ARCHIVE (${searchHits.total} MATCHED SNAPSHOT RECORDS)`}
          </div>
          <div className="grid gap-1.5 md:grid-cols-2">
            {searchHits.titles.map((t) => (
              <div
                key={t.accession + t.title}
                className="mono break-words border border-[rgba(250,250,229,0.12)] bg-[rgba(0,0,0,0.4)] px-2.5 py-1.5 text-[11px] text-[#fafae5]"
              >
                <span className="font-bold text-[#ff4700]">{t.accession}</span>{" "}
                // {t.title}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {studies.map((study) => {
          const active = study.osdId === activeOsdId;
          return (
            <article
              key={study.osdId}
              className={`hud-panel flex flex-col justify-between p-4 ${
                active ? "border-[#c084fc]" : ""
              }`}
            >
              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5">
                  <span className="mono border border-[#c084fc] bg-[rgba(192,132,252,0.14)] px-2 py-0.5 text-[10px] font-bold text-[#c084fc]">
                    {study.osdId} // {study.radiationType}
                  </span>
                  <span className="mono text-[10px] text-[#9b9987]">
                    STRESS x{study.stressMultiplier}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#fafae5]">
                  {study.title}
                </h3>
                <div className="mono mt-1 text-[10px] text-[#ff4700]">
                  {study.organism} | {study.tissueOrCell}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#b9b8a7]">
                  {study.summary}
                </p>
                <div className="mt-2 border-l-2 border-[#5dff9a] bg-[rgba(93,255,154,0.06)] px-2.5 py-1.5 text-[11px] text-[#d9f7e5]">
                  <span className="mono font-bold text-[#5dff9a]">COUNTERMEASURE: </span>
                  {study.countermeasureHint}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {study.keyPathways.map((p) => (
                    <span
                      key={p}
                      className="mono border border-[rgba(250,250,229,0.16)] px-1.5 py-0.5 text-[9.5px] text-[#9b9987]"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <a
                  href={study.osdrUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mono inline-flex items-center gap-1 text-[10px] text-[#54a0ff] hover:underline"
                >
                  Open OSDR Study <ExternalLink size={11} />
                </a>
                <button
                  type="button"
                  onClick={() => onSelectStudy(study.osdId)}
                  className={`hud-btn ${
                    active ? "hud-btn--good" : "hud-btn--primary"
                  }`}
                >
                  <FlaskConical size={12} />
                  {active ? "Active Bio Profile" : "Load Into Drill"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Junior Astronaut Radiobiology Field Check */}
      <section className="hud-panel p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="hud-panel-title">
              JUNIOR ASTRONAUT BIO-SHIELDING FIELD CHECK
            </div>
            <div className="text-xs text-[#9b9987]">
              Verify your understanding of NASA OSDR particle radiobiology ({correctCount}/{QUIZ_QUESTIONS.length} verified).
            </div>
          </div>
          <span className="mono shrink-0 border border-[#5dff9a] px-2.5 py-1 text-xs font-bold text-[#5dff9a]">
            CADET BIO SCORE: {correctCount}/{QUIZ_QUESTIONS.length}
          </span>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {QUIZ_QUESTIONS.map((q, idx) => {
            const picked = answers[q.id];
            const isCorrect = picked === q.correctIndex;
            return (
              <div
                key={q.id}
                className="flex flex-col justify-between border border-[rgba(250,250,229,0.14)] bg-[rgba(0,0,0,0.4)] p-3"
              >
                <div>
                  <div className="mono mb-1 text-[10px] font-bold text-[#ff4700]">
                    FIELD CHECK 0{idx + 1}
                  </div>
                  <p className="text-xs font-semibold text-[#fafae5]">
                    {q.prompt}
                  </p>
                  <div className="mt-2.5 space-y-1.5">
                    {q.options.map((opt, optIdx) => {
                      const chosen = picked === optIdx;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                          }
                          className={`w-full border px-2.5 py-1.5 text-left text-[11px] transition ${
                            chosen
                              ? optIdx === q.correctIndex
                                ? "border-[#5dff9a] bg-[rgba(93,255,154,0.14)] text-[#fafae5]"
                                : "border-[#ff3b30] bg-[rgba(255,59,48,0.14)] text-[#fafae5]"
                              : "border-[rgba(250,250,229,0.16)] bg-[rgba(250,250,229,0.02)] text-[#c7c5b2] hover:border-[#ff4700]"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {picked !== undefined ? (
                  <div
                    className={`mt-2.5 flex items-start gap-1.5 p-2 text-[11px] ${
                      isCorrect
                        ? "bg-[rgba(93,255,154,0.1)] text-[#5dff9a]"
                        : "bg-[rgba(255,59,48,0.1)] text-[#ff938b]"
                    }`}
                  >
                    <CheckCircle2 size={13} className="mt-0.5 shrink-0" />
                    <span>{isCorrect ? q.explanation : "Re-check OSDR high-LET vs proton findings above and try again."}</span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
