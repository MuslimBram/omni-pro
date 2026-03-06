import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PageNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
        <span className="text-4xl">🔍</span>
      </div>
      <h1 className="text-4xl font-bold text-white mb-2">404</h1>
      <p className="text-slate-400 mb-6">Faqja nuk u gjet</p>
      <Link to={createPageUrl("Dashboard")}>
        <Button className="bg-amber-600 hover:bg-amber-700">
          <Home className="w-4 h-4 mr-2" /> Kthehu në Dashboard
        </Button>
      </Link>
    </div>
  );
}