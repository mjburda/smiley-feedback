import { Link } from "react-router";

export default function Index() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 text-neutral-200 relative overflow-hidden">
      {/* Tajné neviditelné tlačítko v pravém horním rohu */}
      <Link 
        to="/results" 
        className="fixed top-0 right-0 w-20 h-20 z-50 cursor-default"
        title=""
      />

      {/* Box s efektem nadnesení při hoveru */}
      <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-red-900/30 p-8 text-center shadow-2xl shadow-red-900/20 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-red-900/40">
        <h1 className="mb-4 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400 drop-shadow-md">
          Smiley Feedback
        </h1>

        <p className="mb-10 text-neutral-400 text-lg">
          Ohodnoť svou zkušenost.
        </p>

        <div className="flex flex-col justify-center items-center">
          {/* Tlačítko s pulzující září */}
          <Link
            to="/feedback"
            className="group relative inline-flex items-center justify-center rounded-xl bg-red-600 px-8 py-4 text-lg font-bold text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all duration-300 hover:bg-red-500 hover:scale-110 hover:shadow-[0_0_40px_rgba(220,38,38,0.8)] active:scale-95"
          >
            <span className="absolute w-full h-full rounded-xl bg-red-400 opacity-20 animate-ping"></span>
            <span className="relative">Začít hodnotit</span>
          </Link>
        </div>
      </div>
    </div>
  );
}