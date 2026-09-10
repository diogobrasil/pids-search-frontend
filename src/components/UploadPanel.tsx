"use client";

import { useState, useRef, useEffect } from "react";
import { Search, UploadCloud, User, Building2, Loader2, HelpCircle, X, FileSpreadsheet, Info } from "lucide-react";
import { SearchService } from "@/services/search.service";
import { useToast } from "@/components/ToastProvider";
import { translateError } from "@/services/error-translator";
import { COMMON_INSTITUTIONS } from "@/constants/institutions";

interface UploadPanelProps {
  onUploadSuccess: (batchId: string) => void;
}

export function UploadPanel({ onUploadSuccess }: UploadPanelProps) {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  const [isLoading, setIsLoading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { addToast } = useToast();
  
  // Single search
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Batch upload
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredInstitutions = COMMON_INSTITUTIONS.filter(inst =>
    inst.toLowerCase().includes(institution.toLowerCase())
  );

  const handleSingleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsLoading(true);
    
    try {
      const result = await SearchService.searchSingle({
        targetName: name,
        ...(institution.trim() && { targetInstitution: institution.trim() }),
      });
      if (result.batchId) {
        onUploadSuccess(result.batchId);
      }
    } catch (err) {
      addToast(translateError(err, "Não foi possível realizar a busca. Tente novamente."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setIsLoading(true);
    
    try {
      const batch = await SearchService.uploadBatch(file);
      onUploadSuccess(batch.id);
    } catch (err) {
      addToast(translateError(err, "Não foi possível processar a planilha. Verifique o arquivo e tente novamente."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-sm border border-slate-200 dark:border-dark-border overflow-hidden transition-colors duration-300">
      <div className="flex border-b border-slate-200 dark:border-dark-border">
        <button
          onClick={() => setActiveTab('single')}
          className={`flex-1 py-4 px-6 font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'single'
              ? 'text-primary dark:text-dark-primary border-b-2 border-primary dark:border-dark-primary bg-slate-50/50 dark:bg-dark-surface-raised/50'
              : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-main dark:hover:text-dark-text-main hover:bg-slate-50 dark:hover:bg-dark-surface-raised'
          }`}
        >
          <Search className="w-4 h-4" />
          Busca Individual
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`flex-1 py-4 px-6 font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'batch'
              ? 'text-primary dark:text-dark-primary border-b-2 border-primary dark:border-dark-primary bg-slate-50/50 dark:bg-dark-surface-raised/50'
              : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-main dark:hover:text-dark-text-main hover:bg-slate-50 dark:hover:bg-dark-surface-raised'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          Processamento em Lote
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'single' && (
          <form onSubmit={handleSingleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-main dark:text-dark-text-main mb-1">Nome Completo *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  id="search-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-dark-border focus:ring-2 focus:ring-primary/20 dark:focus:ring-dark-primary/30 focus:border-primary dark:focus:border-dark-primary outline-none transition-all text-text-main dark:text-dark-text-main placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-dark-surface-raised"
                  placeholder="Ex: João Silva Costa"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main dark:text-dark-text-main mb-1">
                Instituição
                <span className="ml-1 text-xs font-normal text-slate-400 dark:text-slate-500">(opcional)</span>
              </label>
              <div className="relative" ref={dropdownRef}>
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  id="search-institution"
                  type="text"
                  value={institution}
                  onChange={(e) => {
                    setInstitution(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-dark-border focus:ring-2 focus:ring-primary/20 dark:focus:ring-dark-primary/30 focus:border-primary dark:focus:border-dark-primary outline-none transition-all text-text-main dark:text-dark-text-main placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-dark-surface-raised"
                  placeholder="Ex: Universidade Federal do Rio de Janeiro"
                  autoComplete="off"
                />
                {showDropdown && filteredInstitutions.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg shadow-lg">
                    {filteredInstitutions.map((inst) => (
                      <li
                        key={inst}
                        className="px-4 py-2 text-sm text-text-main dark:text-dark-text-main hover:bg-slate-50 dark:hover:bg-dark-surface-raised cursor-pointer"
                        onMouseDown={(e) => {
                          // Prevent input blur before click registers
                          e.preventDefault();
                          setInstitution(inst);
                          setShowDropdown(false);
                        }}
                      >
                        {inst}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Preencher a instituição ajuda a refinar e acelerar a busca.</p>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="w-full bg-primary hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover text-white dark:text-dark-background py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                Buscar
              </button>
            </div>
          </form>
        )}

        {activeTab === 'batch' && (
          <form onSubmit={handleBatchUpload} className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 dark:border-dark-border rounded-lg p-8 text-center bg-slate-50 dark:bg-dark-surface-raised hover:bg-slate-100/50 dark:hover:bg-dark-surface-raised/80 transition-colors">
              <UploadCloud className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
              <p className="text-text-main dark:text-dark-text-main font-medium mb-1">Arraste sua planilha .csv ou clique para selecionar</p>
              <label className="cursor-pointer bg-white dark:bg-dark-surface shadow-sm border border-slate-300 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-surface-raised text-text-main dark:text-dark-text-main py-2 px-6 rounded-lg font-medium transition-colors inline-block mt-4">
                Selecionar Arquivo
                <input
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
              {file && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-dark-border">
                  <p className="text-sm font-medium text-primary dark:text-dark-primary flex items-center justify-center gap-2">
                    Arquivo selecionado: {file.name}
                  </p>
                </div>
              )}
            </div>

            {/* Help Button */}
            <button
              type="button"
              onClick={() => setIsHelpOpen(!isHelpOpen)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-slate-200 dark:border-dark-border text-sm font-medium text-text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-dark-primary hover:border-primary/40 dark:hover:border-dark-primary/40 hover:bg-primary/5 dark:hover:bg-dark-primary/5 transition-all"
            >
              {isHelpOpen ? <X className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
              {isHelpOpen ? 'Fechar ajuda' : 'Como organizar minha planilha?'}
            </button>

            {/* Help Panel */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isHelpOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="rounded-lg border border-primary/20 dark:border-dark-primary/20 bg-primary/5 dark:bg-dark-primary/5 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-primary dark:text-dark-primary mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-text-main dark:text-dark-text-main text-sm">Formato esperado da planilha (.csv)</h4>
                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
                      O arquivo deve ser um <strong>.csv</strong> com codificação UTF-8 e separado por vírgulas.
                    </p>
                  </div>
                </div>

                {/* Column descriptions */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-text-main dark:text-dark-text-main uppercase tracking-wider">Colunas esperadas:</p>
                  <div className="grid gap-2">
                    <div className="flex items-start gap-2.5 bg-white dark:bg-dark-surface rounded-md px-3 py-2 border border-slate-200 dark:border-dark-border">
                      <span className="shrink-0 mt-0.5 w-2 h-2 rounded-full bg-red-400 dark:bg-red-500" />
                      <div>
                        <span className="text-xs font-bold text-text-main dark:text-dark-text-main font-mono">name</span>
                        <span className="ml-1.5 text-[10px] font-semibold text-red-500 dark:text-red-400 uppercase">obrigatório</span>
                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-0.5">Nome completo do pesquisador (ex: João da Silva).</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 bg-white dark:bg-dark-surface rounded-md px-3 py-2 border border-slate-200 dark:border-dark-border">
                      <span className="shrink-0 mt-0.5 w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                      <div>
                        <span className="text-xs font-bold text-text-main dark:text-dark-text-main font-mono">institution</span>
                        <span className="ml-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">opcional</span>
                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-0.5">Instituição de vínculo (ex: Universidade Federal do Rio de Janeiro).</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 bg-white dark:bg-dark-surface rounded-md px-3 py-2 border border-slate-200 dark:border-dark-border">
                      <span className="shrink-0 mt-0.5 w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                      <div>
                        <span className="text-xs font-bold text-text-main dark:text-dark-text-main font-mono">course</span>
                        <span className="ml-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">opcional</span>
                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-0.5">Curso ou programa de pós-graduação (ex: Ciência da Computação).</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Example table */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-text-main dark:text-dark-text-main uppercase tracking-wider">Exemplo:</p>
                  <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-dark-border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-dark-surface-raised">
                          <th className="px-3 py-2 text-left font-bold text-text-main dark:text-dark-text-main font-mono">name</th>
                          <th className="px-3 py-2 text-left font-bold text-text-main dark:text-dark-text-main font-mono">institution</th>
                          <th className="px-3 py-2 text-left font-bold text-text-main dark:text-dark-text-main font-mono">course</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-dark-surface divide-y divide-slate-100 dark:divide-dark-border">
                        <tr>
                          <td className="px-3 py-2 text-text-main dark:text-dark-text-main">João da Silva</td>
                          <td className="px-3 py-2 text-text-secondary dark:text-dark-text-secondary">UFRJ</td>
                          <td className="px-3 py-2 text-text-secondary dark:text-dark-text-secondary">Ciência da Computação</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-text-main dark:text-dark-text-main">Maria Oliveira</td>
                          <td className="px-3 py-2 text-text-secondary dark:text-dark-text-secondary">USP</td>
                          <td className="px-3 py-2 text-text-secondary dark:text-dark-text-secondary"></td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-text-main dark:text-dark-text-main">Carlos Souza</td>
                          <td className="px-3 py-2 text-text-secondary dark:text-dark-text-secondary"></td>
                          <td className="px-3 py-2 text-text-secondary dark:text-dark-text-secondary"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tip */}
                <div className="flex items-start gap-2.5 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 px-3 py-2.5">
                  <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    <strong>Dica:</strong> Preencher a <strong>instituição</strong> e o <strong>curso</strong> aumenta significativamente a precisão da busca no ORCID.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !file}
                className="w-full bg-primary hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover text-white dark:text-dark-background py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
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
