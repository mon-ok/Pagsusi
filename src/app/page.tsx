"use client";

import { MapDashboard } from "@/components/MapDashboard";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { MapPin, TrendingUp, AlertTriangle, HelpCircle } from "lucide-react";
import data from "@/../public/data/data.json";
import { useState } from "react";

interface AnomalyData {
  id: number;
  name: string;
  municipality: string;
  province: string;
  region: number;
  lat: number;
  lng: number;
  anomalyScore: number;
  priority: string;
  turnout: number;
  expected: number;
  residual: number;
  precinctNumber: number;
}


export default function Home() {
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyData | null>(null);

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#E9DFCB] font-sans dark:bg-black">
      <header className="bg-[#62180F] shrink-0">
        <div className="z-10 mx-8 px-2 md:px-4 py-4 md:py-6 text-[#D8BB7B] flex justify-between items-center">
          <div >
            <h1 className="font-(family-name:--font-custom) text-4xl md:text-5xl  ">
              PAGSUSI
            </h1>
            <span className="mt-2 text-sm md:text-base  dark:text-white/80 max-w-2xl font-serif">
              Machine Learning Analysis of Electoral Integrity in the 2025 Philippine Senate Elections
            </span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 hover:bg-white/10  rounded-full transition-colors" aria-label="Methodology">
                <HelpCircle className="w-7 h-7" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] sm:h-[80vh] overflow-y-auto">
              <SheetHeader className="sr-only">
                <SheetTitle>Analysis Methodology</SheetTitle>
                <SheetDescription>
                  Technical foundations and interpretation guidelines for electoral integrity assessment
                </SheetDescription>
              </SheetHeader>
              <section className="bg-white rounded-lg p-4 md:p-8">
                <h2 className="text-[#D8BB7B] font-(family-name:--font-custom) text-3xl md:text-4xl   mb-2">
                  Analysis Methodology
                </h2>
                <p className="text-muted-foreground mb-6 font-serif">
                  Technical foundations and interpretation guidelines for electoral integrity assessment
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8">
                  {/* Data Sources */}
                  <div className="bg-[#e1a200]/5 rounded-lg p-6 border-l-4 border-[#e1a200]">
                    <h3 className="font-serif text-lg font-bold text-[#e1a200] mb-5 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#e1a200]" />
                      Data Sources
                    </h3>
                    <ul className="space-y-3 text-sm text-muted-foreground font-sans">
                      <li className="flex gap-3">
                        <span className="text-[#e1a200] font-bold mt-0.5">→</span>
                        <span>COMELEC barangay-level results (May 2025) via web scraping</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[#e1a200] font-bold mt-0.5">→</span>
                        <span>PSA official barangay shapefiles</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[#e1a200] font-bold mt-0.5">→</span>
                        <span>Computed accessibility features</span>
                      </li>
                    </ul>
                  </div>

                  {/* ML Computation */}
                  <div className="bg-[#00309c]/5 rounded-lg p-6 border-l-4 border-[#00309c]">
                    <h3 className="font-serif text-lg font-bold text-[#00309c] mb-5 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#00309c]" />
                      ML Computation
                    </h3>
                    <ul className="space-y-3 text-sm text-muted-foreground font-sans">
                      <li className="flex gap-2 items-baseline">
                        <span className="text-[#00309c] font-bold text-sm">→</span>
                        <div className="text-xs leading-tight">
                          <span className="font-semibold text-foreground">Feature Engineering:</span>
                          <span className="text-muted-foreground ml-1">Derived spatial metrics and clusters including turnout rates, Moran’s I, and Getis-Ord Gi*.</span>
                        </div>
                      </li>

                      <li className="flex gap-2 items-baseline">
                        <span className="text-[#00309c] font-bold text-sm">→</span>
                        <div className="text-xs leading-tight">
                          <span className="font-semibold text-foreground">Accessibility Modeling:</span>
                          <span className="text-muted-foreground ml-1">Predicted turnout based on infrastructure and accessibility.</span>
                        </div>
                      </li>

                      <li className="flex gap-2 items-baseline">
                        <span className="text-[#00309c] font-bold text-sm">→</span>
                        <div className="text-xs leading-tight">
                          <span className="font-semibold text-foreground">Anomaly Detection:</span>
                          <span className="text-muted-foreground ml-1">Applied Isolation Forest and Local Outlier Factor (LOF) for Multi-Dimensional Anomaly Detection</span>
                        </div>
                      </li>

                      <li className="flex gap-2 items-baseline">
                        <span className="text-[#00309c] font-bold text-sm">→</span>
                        <div className="text-xs leading-tight">
                          <span className="font-semibold text-foreground">Prioritization:</span>
                          <span className="text-muted-foreground ml-1">Ranked Barangays into 4 audit tiers (Critical, High, Medium, Low) by anomaly score.</span>
                        </div>
                      </li>

                      <li className="flex gap-2 items-baseline">
                        <span className="text-[#00309c] font-bold text-sm">→</span>
                        <div className="text-xs leading-tight">
                          <span className="font-semibold text-foreground">Validation:</span>
                          <span className="text-muted-foreground ml-1">Multi-seed checks to ensure outlier stability.</span>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Interpretation */}
                  <div className="bg-[#D40000]/5 rounded-lg p-6 border-l-4 border-[#D40000]">
                    <h3 className="font-serif text-lg font-bold text-[#D40000] mb-5 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-[#D40000]" />
                      Interpretation
                    </h3>
                    <ul className="space-y-3 text-sm text-muted-foreground font-sans">
                      <li className="flex gap-3">
                        <span className="text-[#D40000] font-bold text-base">1</span>
                        <div>
                          <span className="font-semibold text-foreground block">Anomaly Score</span>
                          <span className="text-xs">0-100 deviation index</span>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[#D40000] font-bold text-base">2</span>
                        <div>
                          <span className="font-semibold text-foreground block">Residual Sigma</span>
                          <span className="text-xs">Standard deviations from expected</span>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[#D40000] font-bold text-base">3</span>
                        <div>
                          <span className="font-semibold text-foreground block">Turnout Discrepancy</span>
                          <span className="text-xs">Actual Turnout Rate vs. Predicted Turnout Rate</span>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[#D40000] font-bold text-base">4</span>
                        <div>
                          <span className="font-semibold text-foreground block">Extreme Z-score Deviations (|Z| &gt; 3)</span>
                          <span className="text-xs">Statistical threshold flags</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="p-6 bg-destructive/5 border-2 border-destructive/30 rounded-lg">
                  <p className="text-sm text-foreground font-sans leading-relaxed">
                    <strong className="text-destructive">Disclaimer:</strong> This analysis is for investigative research purposes only. Flagged anomalies represent statistical deviations that warrant further investigation by appropriate authorities. Machine learning models are tools for hypothesis generation and pattern identification, not deterministic proof of irregularities. All interpretations must be considered within their full statistical context and verified through official channels.
                  </p>
                </div>
              </section>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 items-start p-3 overflow-hidden">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-[calc(100vh-147px)] sticky top-4">
            <div className="p-4 border-b border-gray-100">
               <h2 className="font-serif text-lg font-bold text-foreground">Anomalies Detected</h2>
            </div>
            <div className="overflow-y-auto divide-y divide-border">
              {data.map((item) => (
                <div key={item.id} className="p-3 cursor-pointer hover:bg-gray-50" onClick={() => setSelectedAnomaly(item)}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm text-gray-800">{item.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                      item.priority === 'High' ? 'bg-orange-100 text-orange-400' :
                      item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-400' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {item.municipality}, {item.province}
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      Precinct: {item.precinctNumber}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-600 bg-gray-50 p-2 rounded">
                     <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400">Anomaly Score</span>
                        <span className="font-semibold">{item.anomalyScore.toFixed(1)}</span>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-3">
          <MapDashboard data={data} selectedAnomaly={selectedAnomaly} />  
        </div>
      </main>
    </div>
  );
}
