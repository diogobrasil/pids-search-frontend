"use client";

import React, { useEffect, useState, useCallback } from "react";
import { SearchService } from "@/services/search.service";
import { StudentQuery } from "@/types/orcid";
import { ChevronDown, ChevronRight, CheckCircle2, Loader2, UserCheck, ExternalLink } from "lucide-react";

interface DisambiguationTableProps {
  batchId: string;
  isProcessing: boolean;
}

export function DisambiguationTable({ batchId, isProcessing }: DisambiguationTableProps) {
  const [queries, setQueries] = useState<StudentQuery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

  const handleConfirm = async (queryId: string, orcidId: string) => {
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
      
    } catch (error) {
      console.error("Erro ao confirmar ORCID:", error);
      alert("Falha ao confirmar o perfil. Tente novamente.");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 50) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  if (isLoading && queries.length === 0) {
    return (
      <div className="bg-surface rounded-lg shadow-sm border border-slate-200 p-8 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h3 className="font-semibold text-text-main text-lg">Resultados do Processamento</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-text-main">
          <thead className="bg-slate-50 border-b border-slate-200 text-text-secondary">
            <tr>
              <th className="px-6 py-3 font-medium w-10"></th>
              <th className="px-6 py-3 font-medium">Nome do Aluno</th>
              <th className="px-6 py-3 font-medium">Instituição Alvo</th>
              <th className="px-6 py-3 font-medium">ORCID</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {queries.map((query) => {
              const isExpanded = expandedRows.has(query.id);
              const needsReview = query.status === 'PENDING' || query.status === 'FOUND_MULTIPLE';
              const hasCandidates = query.candidates && query.candidates.length > 0;
              const canExpand = needsReview && hasCandidates;
              
              const sortedCandidates = [...(query.candidates || [])].sort((a, b) => b.matchScore - a.matchScore);

              return (
                <React.Fragment key={query.id}>
                  <tr 
                    className={`transition-colors hover:bg-slate-50 ${canExpand ? 'cursor-pointer' : ''}`}
                    onClick={() => canExpand && toggleRow(query.id)}
                  >
                    <td className="px-6 py-4">
                      {canExpand && (
                        <button className="text-slate-400">
                          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium flex items-center gap-2">
                      {query.targetName}
                      {query.status === 'RESOLVED' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {query.targetInstitution || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {query.selectedOrcidId ? (
                        <a 
                          href={`https://orcid.org/${query.selectedOrcidId}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
                        >
                          <img src="https://info.orcid.org/wp-content/uploads/2019/11/orcid_16x16.png" alt="ORCID iD" className="w-3.5 h-3.5" />
                          {query.selectedOrcidId}
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        query.status === 'RESOLVED' || query.status === 'FOUND_SINGLE' ? 'bg-green-100 text-green-700' :
                        query.status === 'NOT_FOUND' ? 'bg-slate-100 text-slate-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {query.status}
                      </span>
                    </td>
                  </tr>

                  {isExpanded && canExpand && (
                    <tr>
                      <td colSpan={4} className="p-0 border-b border-slate-200">
                        <div className="bg-slate-50 p-6 shadow-inner">
                          <div className="space-y-3">
                            {sortedCandidates.map((candidate) => (
                              <div key={candidate.id} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:border-primary/30 transition-colors">
                                <div>
                                  <div className="flex items-center gap-3">
                                    <span className="font-semibold text-text-main">{candidate.returnedName}</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getScoreColor(candidate.matchScore)}`}>
                                      Score: {candidate.matchScore}%
                                    </span>
                                  </div>
                                  <div className="mt-1 flex items-center gap-2 text-sm text-text-secondary">
                                    <a href={`https://orcid.org/${candidate.orcidIdentifier}`} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                      {candidate.orcidIdentifier} <ExternalLink className="w-3 h-3" />
                                    </a>
                                    {candidate.affiliations && (
                                      <span>• {candidate.affiliations}</span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleConfirm(query.id, candidate.orcidIdentifier);
                                  }}
                                  className="px-4 py-2 bg-white border border-slate-300 text-text-main rounded-lg hover:bg-slate-50 hover:text-primary transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
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
                <td colSpan={4} className="px-6 py-8 text-center text-text-secondary">
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
