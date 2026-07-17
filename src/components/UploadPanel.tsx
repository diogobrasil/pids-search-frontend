"use client";

import { useState } from "react";
import { Search, UploadCloud, User, Loader2 } from "lucide-react";
import { SearchService } from "@/services/search.service";

interface UploadPanelProps {
  onUploadSuccess: (batchId: string) => void;
}

export function UploadPanel({ onUploadSuccess }: UploadPanelProps) {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Single search
  const [name, setName] = useState('');
  
  // Batch upload
  const [file, setFile] = useState<File | null>(null);

  const handleSingleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await SearchService.searchSingle({
        targetName: name
      });
      // Assuming backend creates a batch for single search or we adapt UI to just take the batchId
      if (result.batchId) {
        onUploadSuccess(result.batchId);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro ao realizar busca individual.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const userId = 'user-temp-id'; 
      const batch = await SearchService.uploadBatch(file, userId);
      onUploadSuccess(batch.id);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro ao enviar lote.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('single')}
          className={`flex-1 py-4 px-6 font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'single'
              ? 'text-primary border-b-2 border-primary bg-slate-50/50'
              : 'text-text-secondary hover:text-text-main hover:bg-slate-50'
          }`}
        >
          <Search className="w-4 h-4" />
          Busca Individual
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`flex-1 py-4 px-6 font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'batch'
              ? 'text-primary border-b-2 border-primary bg-slate-50/50'
              : 'text-text-secondary hover:text-text-main hover:bg-slate-50'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          Processamento em Lote
        </button>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 flex items-center gap-2">
            <span className="font-semibold">Erro:</span> {error}
          </div>
        )}

        {activeTab === 'single' && (
          <form onSubmit={handleSingleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">Nome Completo *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-main placeholder:text-slate-400"
                  placeholder="Ex: João Silva Costa"
                />
              </div>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                Buscar
              </button>
            </div>
          </form>
        )}

        {activeTab === 'batch' && (
          <form onSubmit={handleBatchUpload} className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50 hover:bg-slate-100/50 transition-colors">
              <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-text-main font-medium mb-1">Arraste sua planilha .csv ou clique para selecionar</p>
              <label className="cursor-pointer bg-white shadow-sm border border-slate-300 hover:bg-slate-50 text-text-main py-2 px-6 rounded-lg font-medium transition-colors inline-block mt-4">
                Selecionar Arquivo
                <input
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
              {file && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-sm font-medium text-primary flex items-center justify-center gap-2">
                    Arquivo selecionado: {file.name}
                  </p>
                </div>
              )}
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !file}
                className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                Processar Planilha
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
