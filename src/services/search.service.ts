import { api } from './api';
import { SearchBatch, StudentQuery } from '../types/orcid';

export const SearchService = {
  // Busca individual (single search)
  async searchSingle(data: { targetName: string; targetInstitution?: string; targetCourse?: string }): Promise<any> {
    const response = await api.post('/search/single', data);
    return response.data;
  },

  // Upload de lote (bulk upload)
  async uploadBatch(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    // Endpoint atualizado conforme backend: /search/bulk
    const response = await api.post('/search/bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Consultar status do lote
  async getBatchStatus(batchId: string): Promise<any> {
    // Endpoint atualizado conforme backend: /search/batch/:id/status
    const response = await api.get(`/search/batch/${batchId}/status`);
    const data = response.data.data || response.data;
    
    // Normalize data structure for UI
    const progress = data.progress || {};
    const pendingCount = (progress['PENDING'] || 0) + (progress['PROCESSING'] || 0);
    const processedRecords = data.totalRecords - pendingCount;
    
    let status = data.status || 'PROCESSING';
    // Se não há itens pendentes, o processamento automático terminou.
    if (pendingCount === 0 && data.totalRecords > 0) {
      status = 'COMPLETED';
    }

    return {
      ...data,
      processedRecords,
      status
    };
  },

  // Consultar resultados do lote
  async getBatchResults(batchId: string): Promise<StudentQuery[]> {
    const response = await api.get(`/search/batch/${batchId}/results`);
    const result = response.data;
    
    // O backend atual retorna um objeto encapsulado: { status: 'success', data: [...], meta: {...} }
    if (result && Array.isArray(result.data)) {
      return result.data;
    }
    
    // Fallback: se for array direto
    if (Array.isArray(result)) {
      return result;
    }
    
    // Tratamento de segurança extra (se o backend retornar um único objeto ao invés de array)
    if (result && typeof result === 'object') {
      return result.data ? [result.data] : [result];
    }
    
    return [];
  },

  // Confirmar/Resolver um match manualmente
  async confirmQuery(queryId: string, orcidId: string): Promise<StudentQuery> {
    // Endpoint atualizado conforme backend: PATCH /search/query/:id/confirm
    const response = await api.patch(`/search/query/${queryId}/confirm`, { selectedOrcidId: orcidId });
    return response.data.data || response.data;
  },
};
