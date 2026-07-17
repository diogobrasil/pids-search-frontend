"use client";

import { useState } from "react";
import { UploadPanel } from "@/components/UploadPanel";
import { BatchProgress } from "@/components/BatchProgress";
import { DisambiguationTable } from "@/components/DisambiguationTable";
import { RefreshCcw } from "lucide-react";

export default function Home() {
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleUploadSuccess = (batchId: string) => {
    setActiveBatchId(batchId);
    setIsProcessing(true);
  };

  const handleProcessingComplete = () => {
    setIsProcessing(false);
  };

  const handleReset = () => {
    setActiveBatchId(null);
    setIsProcessing(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-serif font-bold text-text-main">
          Buscador ORCID
        </h2>
        
        {activeBatchId && (
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm"
          >
            <RefreshCcw className="w-4 h-4" />
            Nova Busca
          </button>
        )}
      </div>

      {!activeBatchId && (
        <UploadPanel onUploadSuccess={handleUploadSuccess} />
      )}

      {activeBatchId && isProcessing && (
        <BatchProgress 
          batchId={activeBatchId} 
          onComplete={handleProcessingComplete} 
        />
      )}

      {activeBatchId && (
        <DisambiguationTable 
          batchId={activeBatchId} 
          isProcessing={isProcessing} 
        />
      )}
    </div>
  );
}
