import { AgentType, AgentConfig } from './types';
import { FunctionDeclaration, Type, Tool } from '@google/genai';

export const APP_NAME = "Sistem Koordinator RS BLU";

export const AGENTS: Record<AgentType, AgentConfig> = {
  [AgentType.RME]: {
    id: AgentType.RME,
    name: "Rekam Medis (RME)",
    description: "Akses, pembaruan, & integrasi data pasien.",
    color: "bg-pink-500",
    icon: "📋"
  },
  [AgentType.ADMIN]: {
    id: AgentType.ADMIN,
    name: "Admin & Keuangan",
    description: "Laporan keuangan, klaim asuransi, & anggaran.",
    color: "bg-indigo-500",
    icon: "💼"
  },
  [AgentType.EDU]: {
    id: AgentType.EDU,
    name: "Edukasi Pasien",
    description: "Pembuatan materi edukasi multimedia.",
    color: "bg-amber-500",
    icon: "🎓"
  },
  [AgentType.CLINICAL]: {
    id: AgentType.CLINICAL,
    name: "Pendukung Klinis",
    description: "Analisis medis mendalam & diagnosis.",
    color: "bg-emerald-500",
    icon: "🩺"
  },
  [AgentType.NONE]: {
    id: AgentType.NONE,
    name: "Koordinator",
    description: "Analisis Intent & Routing",
    color: "bg-slate-500",
    icon: "🤖"
  }
};

export const SYSTEM_INSTRUCTION = `
[ROLE_DEFINITION]
Anda adalah Koordinator Sistem Informasi Rumah Sakit yang sangat cerdas, ahli dalam mengarahkan permintaan operasional dan klinis ke spesialis yang tepat. Tugas utama Anda adalah menganalisis input pengguna secara cermat (Intent Analysis) dan merutekan permintaan tersebut secara eksplisit ke salah satu dari empat Sub-Agen yang Anda miliki.

[PRIMARY_OBJECTIVE]
1. Identifikasi tujuan inti (intent) dari permintaan pengguna: (1) REKAM_MEDIS, (2) ADMINISTRATIF_KEUANGAN, (3) EDUKASI_PASIEN, atau (4) DUKUNGAN_KLINIS.
2. JIKA TUJUAN JELAS: Gunakan fungsi yang relevan di bawah untuk mendeklarasikan pendelegasian tugas.
3. JIKA PERMINTAAN AMBIGU: Anda memiliki wewenang untuk menggunakan Google Search (Grounding) untuk mengumpulkan konteks tambahan atau mengklarifikasi terminologi sebelum melakukan pendelegasian. JIKA anda menggunakan Google Search, rangkum hasil temuan anda kepada pengguna sebelum memutuskan routing atau meminta klarifikasi.

[OUTPUT_FORMAT_RULE]
Hasil akhir Anda HARUS berupa pemanggilan fungsi (Function Call) tunggal kepada Sub-Agen yang Anda pilih, JANGAN memberikan jawaban operasional langsung kepada pengguna jika itu tugas sub-agen.

[CONTEXT_NOTE]
Sistem ini beroperasi di lingkungan BLU (Badan Layanan Umum) yang memprioritaskan efisiensi, akurasi, dan kepatuhan regulasi (seperti PSAK dan Permenkes RME).
`;

// Tool Declarations
const rmeTool: FunctionDeclaration = {
  name: AgentType.RME,
  description: "Mengarahkan permintaan yang berkaitan dengan akses, pembaruan, atau integrasi data Rekam Medis Elektronik (RME) pasien.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      id_pasien: { type: Type.STRING, description: "ID atau Nama Pasien" },
      jenis_akses: { type: Type.STRING, enum: ["Akses_Riwayat", "Update_Diagnosis", "Integrasi_LIS_RIS"] }
    },
    required: ["id_pasien", "jenis_akses"]
  }
};

const adminTool: FunctionDeclaration = {
  name: AgentType.ADMIN,
  description: "Mengarahkan permintaan yang berhubungan dengan proses non-klinis, seperti pembuatan laporan keuangan, penagihan, atau dokumen administratif.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      jenis_dokumen: { type: Type.STRING, enum: ["Laporan_Keuangan", "Klaim_Asuransi", "Anggaran_Biaya"] },
      detail_periode: { type: Type.STRING, description: "Periode waktu (bulan, tahun) atau detail transaksi" }
    },
    required: ["jenis_dokumen", "detail_periode"]
  }
};

const eduTool: FunctionDeclaration = {
  name: AgentType.EDU,
  description: "Mengarahkan permintaan yang bertujuan untuk menghasilkan konten multimedia (diagram, video, dokumen) yang mudah diakses dan bebas jargon.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      topik_edukasi: { type: Type.STRING, description: "Topik kesehatan yang perlu dijelaskan" },
      format_output: { type: Type.STRING, enum: ["Diagram", "Video", "Dokumen"], description: "Format materi yang diinginkan" }
    },
    required: ["topik_edukasi"]
  }
};

const clinicalTool: FunctionDeclaration = {
  name: AgentType.CLINICAL,
  description: "Mengarahkan permintaan yang memerlukan analisis mendalam terhadap data medis atau gambar klinis (multimodal).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      data_klinis: { type: Type.STRING, enum: ["Gejala", "Diagnosis_Awal", "Data_Riwayat"], description: "Jenis data input" },
      tipe_analisis: { type: Type.STRING, enum: ["Diagnosis_Banding", "Perencanaan_Terapi", "Analisis_Gambar_Medis"] }
    },
    required: ["data_klinis", "tipe_analisis"]
  }
};

export const COORDINATOR_TOOLS: Tool[] = [
  {
    functionDeclarations: [rmeTool, adminTool, eduTool, clinicalTool],
  },
  {
    googleSearch: {}
  }
];
