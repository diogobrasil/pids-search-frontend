"use client";

import React, { useEffect, useState, useCallback } from "react";
import { SearchService } from "@/services/search.service";
import type { StudentQuery, ResearcherCandidate } from "@/types/orcid";
import { ChevronDown, ChevronRight, CheckCircle2, Loader2, UserCheck, ExternalLink, Clock, AlertCircle, XCircle, AlertOctagon } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { translateError } from "@/services/error-translator";

interface DisambiguationTableProps {
  batchId: string;
  isProcessing: boolean;
}

const StatusBadge = ({ status }: { status: StudentQuery['status'] }) => {
  const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    PENDING: { label: 'Pendente', className: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-400 border-slate-200 dark:border-slate-800', icon: <Clock className="w-3 h-3 mr-1.5" /> },
    PROCESSING: { label: 'Processando', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800', icon: <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> },
    FOUND_SINGLE: { label: '1 Correspondência', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', icon: <CheckCircle2 className="w-3 h-3 mr-1.5" /> },
    FOUND_MULTIPLE: { label: 'Múltiplos (Revisar)', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800', icon: <AlertCircle className="w-3 h-3 mr-1.5" /> },
    RESOLVED: { label: 'Confirmado', className: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 border-green-200 dark:border-green-800', icon: <UserCheck className="w-3 h-3 mr-1.5" /> },
    NOT_FOUND: { label: 'Não Encontrado', className: 'bg-slate-100 text-slate-600 dark:bg-dark-surface-raised dark:text-dark-text-secondary border-slate-200 dark:border-dark-border', icon: <XCircle className="w-3 h-3 mr-1.5" /> },
    ERROR: { label: 'Erro', className: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-800', icon: <AlertOctagon className="w-3 h-3 mr-1.5" /> },
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

const getLattesUrl = (lattesId: string) => {
  return lattesId.length === 10 
    ? `http://buscatextual.cnpq.br/buscatextual/visualizacv.do?id=${lattesId}`
    : `http://lattes.cnpq.br/${lattesId}`;
};

export function DisambiguationTable({ batchId, isProcessing }: DisambiguationTableProps) {
  const [queries, setQueries] = useState<StudentQuery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [scrapingLattes, setScrapingLattes] = useState<Record<string, boolean>>({});
  const { addToast } = useToast();

  const fetchResults = useCallback(async () => {
    try {
      const data = await SearchService.getBatchResults(batchId);
      setQueries(data);
    } catch (error) {
      console.error("Erro ao carregar resultados:", error);
    } finally {
      setIsLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    fetchResults();
    let intervalId: NodeJS.Timeout;
    
    if (isProcessing) {
      intervalId = setInterval(fetchResults, 3000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [batchId, isProcessing, fetchResults]);

  const toggleRow = (queryId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(queryId)) {
      newExpanded.delete(queryId);
    } else {
      newExpanded.add(queryId);
    }
    setExpandedRows(newExpanded);
  };

  const handleApprove = async (queryId: string, orcidId: string | null) => {
    if (!orcidId) return;
    try {
      await SearchService.confirmQuery(queryId, orcidId);
      
      setQueries(prev => prev.map(q => {
        if (q.id === queryId) {
          return { ...q, status: 'RESOLVED', selectedOrcidId: orcidId };
        }
        return q;
      }));
      
      const newExpanded = new Set(expandedRows);
      newExpanded.delete(queryId);
      setExpandedRows(newExpanded);

      addToast("Perfil ORCID confirmado com sucesso!", "success");
      
    } catch (error) {
      console.error("Erro ao confirmar ORCID:", error);
      addToast(translateError(error, "Não foi possível confirmar o perfil. Tente novamente."));
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800/50";
    if (score >= 50) return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800/50";
    return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/50";
  };

  const handleScrapeLattes = async (queryId: string, candidateId: string) => {
    setScrapingLattes(prev => ({ ...prev, [candidateId]: true }));
    addToast('Iniciando busca no Lattes. Isso pode demorar...', 'info');
    try {
      await SearchService.scrapeLattes(queryId, candidateId);
      addToast('Lattes extraído com sucesso!', 'success');
      fetchResults(); // Atualiza a tabela
    } catch (error: any) {
      console.error('Erro no Lattes:', error);
      addToast(error.response?.data?.message || 'Falha ao buscar no Lattes', 'error');
    } finally {
      setScrapingLattes(prev => ({ ...prev, [candidateId]: false }));
    }
  };

  const renderExternalIds = (candidate: ResearcherCandidate, queryId: string) => (
    <div className="mt-2 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
      {candidate.scopusId && (
        <a
          href={`https://www.scopus.com/authid/detail.uri?authorId=${candidate.scopusId}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/50 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Scopus: {candidate.scopusId}
        </a>
      )}
      {candidate.researcherId && (
        <a
          href={`https://www.webofscience.com/wos/author/record/${candidate.researcherId}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          ResearcherID: {candidate.researcherId}
        </a>
      )}
        {candidate.lattesId ? (
          <a
            href={getLattesUrl(candidate.lattesId)}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/50 hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Lattes: {candidate.lattesId}
          </a>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleScrapeLattes(queryId, candidate.id);
            }}
            disabled={scrapingLattes[candidate.id]}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300 dark:bg-dark-surface dark:text-dark-text-main dark:border-dark-border hover:bg-slate-200 dark:hover:bg-dark-border disabled:opacity-50 transition-colors"
          >
            {scrapingLattes[candidate.id] ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <ExternalLink className="w-3 h-3" />
            )}
            Buscar Lattes
          </button>
        )}
      {candidate.openAlexId && (
        <a
          href={`https://openalex.org/${candidate.openAlexId}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/50 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          OpenAlex: {candidate.openAlexId}
        </a>
      )}
      </div>
      {candidate.lattesAmbiguous && (
        <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded w-fit border border-yellow-200 dark:border-yellow-800/30">
          ⚠ Existem pesquisadores homônimos no Lattes. Por favor, revise antes de confirmar.
        </span>
      )}
    </div>
  );

  if (isLoading && queries.length === 0) {
    return (
      <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-sm border border-slate-200 dark:border-dark-border p-8 flex justify-center transition-colors duration-300">
        <Loader2 className="w-6 h-6 animate-spin text-primary dark:text-dark-primary" />
      </div>
    );
  }

  return (
    <div className="bg-surface dark:bg-dark-surface rounded-lg shadow-sm border border-slate-200 dark:border-dark-border overflow-hidden transition-colors duration-300">
      <div className="p-4 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface-raised">
        <h3 className="font-semibold text-text-main dark:text-dark-text-main text-lg">Resultados do Processamento</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-text-main dark:text-dark-text-main">
          <thead className="bg-slate-50 dark:bg-dark-surface-raised border-b border-slate-200 dark:border-dark-border text-text-secondary dark:text-dark-text-secondary">
            <tr>
              <th className="px-6 py-3 font-medium w-10"></th>
              <th className="px-6 py-3 font-medium">Nome do Aluno</th>
              <th className="px-6 py-3 font-medium">Instituição Alvo</th>
              <th className="px-6 py-3 font-medium">ORCID</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
            {queries.map((query) => {
              const isExpanded = expandedRows.has(query.id);
              const needsReview = query.status === 'PENDING' || query.status === 'FOUND_MULTIPLE';
              const hasCandidates = query.candidates && query.candidates.length > 0;
              const canExpand = needsReview && hasCandidates;
              
              const sortedCandidates = [...(query.candidates || [])].sort((a, b) => b.matchScore - a.matchScore);

              return (
                <React.Fragment key={query.id}>
                  <tr 
                    className={`transition-colors hover:bg-slate-50 dark:hover:bg-dark-surface-raised ${canExpand ? 'cursor-pointer' : ''}`}
                    onClick={() => canExpand && toggleRow(query.id)}
                  >
                    <td className="px-6 py-4">
                      {canExpand && (
                        <button className="text-slate-400 dark:text-slate-500">
                          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium flex items-center gap-2">
                      {query.targetName}
                      {query.status === 'RESOLVED' && <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />}
                    </td>
                    <td className="px-6 py-4 text-text-secondary dark:text-dark-text-secondary">
                      {query.targetInstitution || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {query.selectedOrcidId ? (
                        <div className="flex flex-col gap-1.5">
                          <a 
                            href={`https://orcid.org/${query.selectedOrcidId}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-dark-surface-raised text-slate-700 dark:text-dark-text-main hover:bg-slate-200 dark:hover:bg-dark-border transition-colors border border-slate-200 dark:border-dark-border"
                          >
                            <img src="https://info.orcid.org/wp-content/uploads/2019/11/orcid_16x16.png" alt="ORCID iD" className="w-3.5 h-3.5" />
                            {query.selectedOrcidId}
                          </a>
                          {query.candidates?.find(c => c.orcidIdentifier === query.selectedOrcidId) && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              {(() => {
                                const c = query.candidates.find(cand => cand.orcidIdentifier === query.selectedOrcidId)!;
                                return (
                                  <>
                                    {c.scopusId && (
                                      <a href={`https://www.scopus.com/authid/detail.uri?authorId=${c.scopusId}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/50 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors">
                                        Scopus: {c.scopusId}
                                      </a>
                                    )}
                                    {c.researcherId && (
                                      <a href={`https://www.webofscience.com/wos/author/record/${c.researcherId}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                                        ResearcherID: {c.researcherId}
                                      </a>
                                    )}
                                    {c.lattesId ? (
                                      <a href={getLattesUrl(c.lattesId)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-teal-100 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/50 hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors">
                                        Lattes: {c.lattesId}
                                      </a>
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleScrapeLattes(query.id, c.id);
                                        }}
                                        disabled={scrapingLattes[c.id]}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-300 dark:bg-dark-surface dark:text-dark-text-main dark:border-dark-border hover:bg-slate-200 dark:hover:bg-dark-border disabled:opacity-50 transition-colors"
                                      >
                                        {scrapingLattes[c.id] ? (
                                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                        ) : (
                                          <ExternalLink className="w-2.5 h-2.5" />
                                        )}
                                        Buscar Lattes
                                      </button>
                                    )}
                                    {c.openAlexId && (
                                      <a href={`https://openalex.org/${c.openAlexId}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/50 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                                        OpenAlex: {c.openAlexId}
                                      </a>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={query.status} />
                    </td>
                  </tr>

                  {isExpanded && canExpand && (
                    <tr>
                      <td colSpan={5} className="p-0 border-b border-slate-200 dark:border-dark-border">
                        <div className="bg-slate-50 dark:bg-dark-background p-6 shadow-inner">
                          <div className="space-y-3">
                            {sortedCandidates.map((candidate) => (
                              <div key={candidate.id} className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg p-4 flex items-center justify-between hover:border-primary/30 dark:hover:border-dark-primary/30 transition-colors">
                                <div>
                                  <div className="flex items-center gap-3">
                                    <span className="font-semibold text-text-main dark:text-dark-text-main">{candidate.returnedName}</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getScoreColor(candidate.matchScore)}`}>
                                      Score: {candidate.matchScore}%
                                    </span>
                                  </div>
                                  <div className="mt-1 flex items-center gap-2 text-sm text-text-secondary dark:text-dark-text-secondary">
                                    <a href={`https://orcid.org/${candidate.orcidIdentifier}`} target="_blank" rel="noreferrer" className="text-primary dark:text-dark-primary hover:underline flex items-center gap-1">
                                      {candidate.orcidIdentifier} <ExternalLink className="w-3 h-3" />
                                    </a>
                                    {candidate.affiliations && (
                                      <span>• {candidate.affiliations}</span>
                                    )}
                                  </div>
                                  {renderExternalIds(candidate, query.id)}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApprove(query.id, candidate.orcidIdentifier);
                                  }}
                                  className="px-4 py-2 bg-white dark:bg-dark-surface-raised border border-slate-300 dark:border-dark-border text-text-main dark:text-dark-text-main rounded-lg hover:bg-slate-50 dark:hover:bg-dark-border hover:text-primary dark:hover:text-dark-primary transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
                                >
                                  <UserCheck className="w-4 h-4" />
                                  Confirmar Perfil
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            
            {queries.length === 0 && !isProcessing && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-text-secondary dark:text-dark-text-secondary">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
