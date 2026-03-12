import { Link } from "react-router-dom";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-24 h-24 bg-zinc-900 rounded-2xl flex items-center justify-center border-2 border-zinc-700 mb-6">
        <AlertTriangle className="w-12 h-12 text-amber-400" />
      </div>
      <h1 className="text-5xl font-black text-white mb-2">404</h1>
      <h2 className="text-xl font-bold text-zinc-400 mb-3">Page Not Found</h2>
      <p className="text-sm text-zinc-500 max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved. Maybe the room was deleted, or you typed the wrong URL.
      </p>
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold rounded-lg transition-all text-sm"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    </div>
  );
}
