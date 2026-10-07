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

export default function Home() {
  const [hodnoceni, setHodnoceni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [poznamka, setPoznamka] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    async function nactiHodnoceni() {
      try {
        const data = await sql(
          "SELECT * FROM hodnoceni ORDER BY hodnota ASC"
        );
        setHodnoceni(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Nepodařilo se načíst hodnocení z databáze.");
      } finally {
        setLoading(false);
      }
    }

    nactiHodnoceni();
  }, []);

  async function handleVote(id) {
    if (saving) return;
    setSaving(true);
    setError("");

    try {
      const cleanPoznamka = poznamka.replace(/'/g, "''");
      const query = cleanPoznamka
        ? `INSERT INTO odpovedi (hodnoceni_id, poznamka) VALUES (${id}, '${cleanPoznamka}')`
        : `INSERT INTO odpovedi (hodnoceni_id) VALUES (${id})`;

      await sql(query);
      
      setPoznamka("");
      setSelectedId(null);

      showToast("Hodnocení úspěšně uloženo! ❤️", "success");
    } catch (err) {
      console.error(err);
      showToast("Nepodařilo se uložit tvé hodnocení.", "error");
    } finally {
      setSaving(false);
    }
  }

  function showToast(message, type) {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 sm:p-6 text-neutral-200 relative">
      {/* Toast notifikace v pravém horním rohu */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-2xl border transition-all duration-500 animate-bounce ${
          toast.type === "success" 
            ? "bg-neutral-900 border-red-600 text-red-400 shadow-red-900/30" 
            : "bg-red-950 border-red-800 text-white shadow-red-900/50"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Tajné tlačítko pro výsledky */}
      <Link 
        to="/results" 
        className="fixed top-0 right-0 w-24 h-24 z-40 cursor-default"
        title=""
      />

      <div className="w-full max-w-4xl rounded-2xl bg-neutral-900 border border-red-900/30 p-6 sm:p-10 text-center shadow-2xl shadow-red-900/10 relative">
        <Link to="/" className="absolute top-4 left-4 sm:top-6 sm:left-6 text-neutral-500 hover:text-white transition-colors duration-300">
          &larr; Zpět
        </Link>
        
        <h1 className="mb-3 mt-8 sm:mt-4 text-3xl font-bold text-white">
          Jak se ti u nás líbilo?
        </h1>

        <p className="mb-6 text-neutral-400">
          Vyber jednu možnost
        </p>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="w-10 h-10 border-4 border-red-900 border-t-red-500 rounded-full animate-spin"></div>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-950/50 border border-red-800 p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        {!loading && hodnoceni.length > 0 && (
          <>
            <div className="flex flex-wrap sm:flex-nowrap justify-center gap-3 sm:gap-4 lg:gap-6 mt-4">
              {hodnoceni.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={saving}
                  onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className={`group rounded-xl border-2 p-4 flex flex-col items-center justify-center w-24 h-28 sm:w-28 sm:h-32 md:w-32 md:h-36 
                  transition-all duration-300 transform hover:scale-110 active:scale-95 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]
                  ${saving ? "cursor-not-allowed opacity-50" : "cursor-pointer"} 
                  ${selectedId === item.id 
                      ? "border-red-500 bg-red-950/50 scale-105 shadow-[0_0_25px_rgba(220,38,38,0.4)]" 
                      : "border-neutral-800 bg-neutral-950 hover:border-red-600/50 hover:bg-neutral-800"
                  }`}
                >
                  <div className="text-4xl sm:text-5xl drop-shadow-md transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-110">
                    {emojiMap[item.hodnota]}
                  </div>
                  <div className="mt-4 text-xs sm:text-sm font-medium text-neutral-400 transition-colors duration-300 group-hover:text-white">
                    {item.text}
                  </div>
                </button>
              ))}
            </div>

            {selectedId !== null && (
              <div className="mt-8 pt-6 border-t border-neutral-800 animate-in fade-in duration-300 max-w-lg mx-auto">
                <input
                  type="text"
                  placeholder="Napiš krátký komentář (nepovinné)..."
                  value={poznamka}
                  onChange={(e) => setPoznamka(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-red-600 transition mb-4 text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleVote(selectedId)}
                  disabled={saving}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 font-bold text-white rounded-xl shadow-lg shadow-red-600/30 transition transform hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  {saving ? "Odesílám..." : "Odeslat hodnocení"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}