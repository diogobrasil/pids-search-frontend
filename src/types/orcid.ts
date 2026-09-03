export interface SearchBatch {
  id: string;
  userId: string;
  originalFileName: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalRecords: number;
  processedRecords: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentQuery {
  id: string;
  batchId: string;
  targetName: string;
  targetInstitution: string | null;
  targetCourse: string | null;
  status: 'PENDING' | 'PROCESSING' | 'FOUND_SINGLE' | 'FOUND_MULTIPLE' | 'RESOLVED' | 'NOT_FOUND' | 'ERROR';
  selectedOrcidId: string | null;
  createdAt: string;
  updatedAt: string;
  candidates?: ResearcherCandidate[];
}

export interface ResearcherCandidate {
  id: string;
  studentQueryId: string;
  orcidIdentifier: string | null;
  returnedName: string;
  affiliations: string | null;
  scopusId: string | null;
  researcherId: string | null;
  lattesId: string | null;
  lattesAmbiguous: boolean;
  openAlexId: string | null;
  matchScore: number;
  isApproved: boolean;
  createdAt: string;
}
