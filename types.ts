export enum Sender {
  USER = 'user',
  COORDINATOR = 'coordinator',
  SYSTEM = 'system'
}

export enum AgentType {
  RME = 'pengelola_rekam_medis',
  ADMIN = 'pemroses_dokumen_adm',
  EDU = 'pencipta_materi_edukasi',
  CLINICAL = 'agen_pendukung_klinis',
  NONE = 'none'
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  isRouting?: boolean;
  routedTo?: AgentType;
  functionArgs?: any;
  groundingChunks?: GroundingChunk[];
}

export interface AgentConfig {
  id: AgentType;
  name: string;
  description: string;
  color: string;
  icon: string;
}