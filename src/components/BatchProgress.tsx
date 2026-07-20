"use client";

import { useEffect, useState } from "react";
import { SearchService } from "@/services/search.service";
import { SearchBatch } from "@/types/orcid";
import { Loader2 } from "lucide-react";

interface BatchProgressProps {
  batchId: string;
  onComplete: () => void;
}

export function BatchProgress({ batchId, onComplete }: BatchProgressProps) {
  const [batch, setBatch] = useState<SearchBatch | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        const data = await SearchService.getBatchStatus(batchId);
        setBatch(data);

        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          clearInterval(intervalId);
          onComplete(); 
        }
      } catch (err) {
        console.error("Failed to fetch batch status:", err);
      }
    };

    fetchStatus();
    intervalId = setInterval(fetchStatus, 3000);

    return () => clearInterval(intervalId);
  }, [batchId, onComplete]);

  if (!batch) {
    return (
      <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-sm border border-slate-200 dark:border-dark-border p-6 flex items-center justify-center gap-3 transition-colors duration-300">
        <Loader2 className="w-5 h-5 animate-spin text-primary dark:text-dark-primary" />
        <span className="text-text-secondary dark:text-dark-text-secondary font-medium">Iniciando processamento...</span>
      </div>
    );
  }

  const percentage = batch.totalRecords > 0 
    ? Math.round((batch.processedRecords / batch.totalRecords) * 100) 
    : 0;

  return (
    <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-sm border border-slate-200 dark:border-dark-border p-6 transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary dark:text-dark-primary" />
          <h3 className="font-medium text-text-main dark:text-dark-text-main">Processando Lote</h3>
        </div>
        <span className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">
          {percentage}%
        </span>
      </div>

      <div className="w-full bg-slate-100 dark:bg-dark-surface-raised rounded-full h-3 mb-3 overflow-hidden border border-slate-200 dark:border-dark-border">
        <div 
          className="h-full rounded-full bg-primary dark:bg-dark-primary transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <p className="text-sm text-text-secondary dark:text-dark-text-secondary text-center">
        Processando {batch.processedRecords} de {batch.totalRecords} registros
      </p>
    </div>
  );
}
