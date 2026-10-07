import { useEffect, useState } from "react";
import { Link } from "react-router";
import { sql } from "../sql.js";

const emojiMap = {
  1: "😡",
  2: "🙁",
  3: "😐",
  4: "🙂",
  5: "😍",
};

export default function Results() {
  const [stats, setStats] = useState([]);
  const [komentare, setKomentare] = useState([]);
  const [average, setAverage] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [animateBars, setAnimateBars] = useState(false);

  useEffect(() => {
    async function loadResults() {
      setLoading(true);
      setError("");
      setAnimateBars(false);
      try {
        let timeConditionStats = "";
        let timeConditionKomentare = "";
        
        if (filter === "1h") {
          timeConditionStats = "AND o.datum >= DATE_SUB(NOW(), INTERVAL 1 HOUR)";
          timeConditionKomentare = "WHERE o.datum >= DATE_SUB(NOW(), INTERVAL 1 HOUR)";
        } else if (filter === "24h") {
          timeConditionStats = "AND o.datum >= DATE_SUB(NOW(), INTERVAL 24 HOUR)";
          timeConditionKomentare = "WHERE o.datum >= DATE_SUB(NOW(), INTERVAL 24 HOUR)";
        } else if (filter === "7d") {
          timeConditionStats = "AND o.datum >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
          timeConditionKomentare = "WHERE o.datum >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        }

        const data = await sql(`
          SELECT h.id, h.text, h.hodnota, COUNT(o.id) as pocet
          FROM hodnoceni h
          LEFT JOIN odpovedi o ON h.id = o.hodnoceni_id ${timeConditionStats}
          GROUP BY h.id, h.text, h.hodnota
          ORDER BY h.hodnota DESC
        `);

        // Načtení komentářů
        const komData = await sql(`
          SELECT o.poznamka, o.datum, h.hodnota 
          FROM odpovedi o
          JOIN hodnoceni h ON o.hodnoceni_id = h.id
          ${timeConditionKomentare ? timeConditionKomentare + " AND o.poznamka IS NOT NULL AND o.poznamka != ''" : "WHERE o.poznamka IS NOT NULL AND o.poznamka != ''"}
          ORDER BY o.datum DESC
          LIMIT 10
        `);

        if (Array.isArray(data)) {
          let sum = 0;
          let count = 0;

          const parsedData = data.map(item => {
            const pocet = parseInt(item.pocet, 10) || 0;
            const hodnota = parseInt(item.hodnota, 10) || 0;
            sum += pocet * hodnota;
            count += pocet;
            return { ...item, pocet, hodnota };
          });

          setStats(parsedData);
          setKomentare(Array.isArray(komData) ? komData : []);
          setTotalVotes(count);
          setAverage(count > 0 ? (sum / count).toFixed(1) : 0);
          
          setTimeout(() => setAnimateBars(true), 100);
        }
      } catch (err) {
        console.error(err);
        setError("Nepodařilo se načíst statistiky.");
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, [filter]);

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center p-6 text-neutral-200">
      <div className="w-full max-w-2xl rounded-2xl bg-neutral-900 border border-red-900/30 p-8 shadow-2xl shadow-red-900/10 relative mt-10 transition-all duration-500">
        <Link to="/" className="absolute top-4 left-4 text-neutral-500 hover:text-white transition-colors duration-300">
          &larr; Zpět
        </Link>

        <h1 className="mb-2 mt-4 text-center text-3xl font-bold text-white">Výsledky hodnocení</h1>
        <p className="mb-6 text-center text-neutral-400">Statistiky spokojenosti zákazníků</p>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: "all", label: "Celkově" },
            { id: "1h", label: "Poslední hodina" },
            { id: "24h", label: "Posledních 24 hod" },
            { id: "7d", label: "Posledních 7 dní" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 active:scale-95 cursor-pointer ${
                filter === f.id
                  ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] transform scale-105"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-10 h-10 border-4 border-red-900 border-t-red-500 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-950/50 border border-red-800 p-4 text-red-400 text-center">{error}</div>
        ) : totalVotes === 0 ? (
          <p className="text-center text-neutral-500 py-8">Pro toto období nebylo zaznamenáno žádné hodnocení.</p>
        ) : (
          <>
            <div className="mb-10 flex flex-col items-center justify-center transform transition-all duration-700 hover:scale-105">
              <div className="text-7xl font-black text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse">
                {average}
              </div>
              <div className="text-sm font-bold text-neutral-500 uppercase tracking-widest mt-2">
                Průměrné skóre
              </div>
              <div className="mt-3 text-neutral-400 bg-neutral-950 border border-neutral-800 px-4 py-1.5 rounded-full text-sm shadow-inner">
                Celkem hlasů: <span className="text-white font-medium">{totalVotes}</span>
              </div>
            </div>

            <div className="space-y-5 mb-10">
              {stats.map((item) => {
                const percentage = totalVotes > 0 ? Math.round((item.pocet / totalVotes) * 100) : 0;
                
                return (
                  <div key={item.id} className="flex items-center gap-4 group">
                    <div className="w-12 text-3xl text-right drop-shadow-sm transition-transform duration-300 group-hover:scale-125 group-hover:-translate-y-1" title={item.text}>
                      {emojiMap[item.hodnota]}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1.5 text-sm">
                        <span className="font-semibold text-neutral-300 group-hover:text-white transition-colors">{item.text}</span>
                        <span className="text-neutral-400 font-medium">
                          {item.pocet} <span className="text-neutral-500 text-xs">({percentage}%)</span>
                        </span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-neutral-950 border border-neutral-800 overflow-hidden shadow-inner">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-red-800 to-red-500 transition-all duration-1000 ease-out relative"
                          style={{ width: animateBars ? `${percentage}%` : '0%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sekce s komentáři */}
            {komentare.length > 0 && (
              <div className="mt-8 pt-6 border-t border-neutral-800">
                <h3 className="text-lg font-bold text-white mb-4 text-left">Poslední komentáře</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {komentare.map((k, index) => (
                    <div key={index} className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-3 text-left text-sm flex items-start gap-3">
                      <span className="text-xl">{emojiMap[k.hodnota]}</span>
                      <div className="flex-1">
                        <p className="text-neutral-300">{k.poznamka}</p>
                        <span className="text-xs text-neutral-600 mt-1 block">{k.datum}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}