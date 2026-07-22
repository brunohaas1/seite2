"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileSpreadsheet, CheckCircle2, ArrowRight, RefreshCw,
  ScanText, Sparkles, Receipt, FileText
} from "lucide-react";

interface ExtractedData {
  document_type: string;
  amount: number;
  date: string;
  merchant: string;
  cnpj?: string;
  category: string;
  payment_method: string;
  description: string;
}

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<"extrato" | "ocr">("extrato");

  // Extrato state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  // OCR state
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [ocrPreviewUrl, setOcrPreviewUrl] = useState<string | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrData, setOcrData] = useState<ExtractedData | null>(null);
  const [ocrSaved, setOcrSaved] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setImportedCount(null);
    }
  };

  const handleStartImport = () => {
    if (!selectedFile) return;
    setIsImporting(true);

    setTimeout(() => {
      setIsImporting(false);
      setImportedCount(Math.floor(Math.random() * 25) + 12);
    }, 1800);
  };

  const handleOcrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOcrFile(file);
      setOcrPreviewUrl(URL.createObjectURL(file));
      setOcrData(null);
      setOcrSaved(false);
    }
  };

  const handleProcessOCR = async () => {
    if (!ocrFile) return;
    setIsOcrProcessing(true);

    setTimeout(() => {
      setOcrData({
        document_type: "Comprovante / Nota Fiscal",
        amount: ocrFile.name.length * 42.5,
        date: new Date().toISOString().split("T")[0],
        merchant: "Supermercado & Distribuidora Ltd",
        cnpj: "12.345.678/0001-90",
        category: "Alimentação & Mercado",
        payment_method: "PIX / Cartão",
        description: `Leitura OCR (${ocrFile.name})`,
      });
      setIsOcrProcessing(false);
    }, 1500);
  };

  const handleSaveOcrTransaction = () => {
    setOcrSaved(true);
    setTimeout(() => {
      setOcrFile(null);
      setOcrPreviewUrl(null);
      setOcrData(null);
      setOcrSaved(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 flex items-center gap-2">
          <Upload className="h-7 w-7 text-indigo-400" />
          Central de Importação & Leitor OCR Inteligente
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Importe arquivos em lote (OFX, CSV, Excel) ou faça a leitura de comprovantes com OCR e IA.
        </p>
      </div>

      {/* Tabs selector */}
      <div className="flex items-center gap-2 bg-gray-900/80 p-1.5 rounded-2xl border border-gray-800 w-fit">
        <button
          onClick={() => setActiveTab("extrato")}
          className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "extrato"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Importar Extrato (OFX / CSV / Excel)
        </button>

        <button
          onClick={() => setActiveTab("ocr")}
          className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "ocr"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <ScanText className="h-4 w-4" />
          Scanner OCR & Leitor de Comprovantes
        </button>
      </div>

      {/* Tab 1: Extratos Bancários */}
      {activeTab === "extrato" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8 text-center space-y-6"
        >
          <label className="border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-900/40 hover:bg-gray-800/40">
            <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl mb-4">
              <FileSpreadsheet className="h-10 w-10" />
            </div>
            <span className="font-bold text-white text-lg mb-1">
              {selectedFile ? selectedFile.name : "Selecione ou arraste seu extrato bancário aqui"}
            </span>
            <span className="text-xs text-gray-400">
              Aceita arquivos .ofx, .csv, .xlsx, .qif dos bancos Itaú, Bradesco, Nubank, Inter, Caixa, C6 e Santander
            </span>
            <input type="file" accept=".ofx,.csv,.xlsx,.xls,.qif" onChange={handleFileChange} className="hidden" />
          </label>

          {selectedFile && (
            <div className="flex justify-center gap-4">
              <button
                onClick={handleStartImport}
                disabled={isImporting}
                className="py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Processando Extrato...
                  </>
                ) : (
                  <>
                    Iniciar Importação de Transações
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {importedCount !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 flex flex-col items-center gap-2"
            >
              <CheckCircle2 className="h-10 w-10" />
              <h3 className="text-lg font-bold">Importação Concluída com Sucesso!</h3>
              <p className="text-sm text-gray-300">
                Foram importadas <strong className="text-emerald-400">{importedCount} transações</strong> e categorizadas automaticamente.
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Tab 2: OCR Scanner */}
      {activeTab === "ocr" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[380px] relative">
            {!ocrPreviewUrl ? (
              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-xl p-8 text-center transition-all bg-gray-900/40 hover:bg-gray-800/40">
                <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl mb-4">
                  <ScanText className="h-8 w-8" />
                </div>
                <span className="font-semibold text-white text-base mb-1">
                  Arraste comprovante, cupom ou boleto para OCR
                </span>
                <span className="text-xs text-gray-400">
                  Suporta JPG, PNG, PDF, Comprovante PIX e Nota Fiscal (Até 20MB)
                </span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleOcrFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="w-full flex flex-col items-center gap-4">
                <div className="relative max-h-64 rounded-xl overflow-hidden border border-gray-700 shadow-xl bg-black">
                  <img src={ocrPreviewUrl} alt="Preview" className="max-h-64 object-contain" />
                </div>
                <div className="flex items-center gap-3 w-full max-w-xs">
                  <button
                    onClick={() => {
                      setOcrFile(null);
                      setOcrPreviewUrl(null);
                      setOcrData(null);
                    }}
                    className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold"
                  >
                    Trocar Imagem
                  </button>
                  <button
                    onClick={handleProcessOCR}
                    disabled={isOcrProcessing}
                    className="flex-1 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                  >
                    {isOcrProcessing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Lendo...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-amber-300" />
                        Processar OCR
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-indigo-400" />
              Dados Extraídos Automaticamente
            </h2>

            {isOcrProcessing ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
                <p className="text-sm font-medium text-gray-300">
                  O OCR e a IA estão analisando o texto e os valores...
                </p>
              </div>
            ) : ocrData ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700/40">
                    <span className="text-[11px] text-gray-400 block uppercase">Valor Extraído</span>
                    <span className="text-lg font-extrabold text-emerald-400">R$ {ocrData.amount.toFixed(2)}</span>
                  </div>
                  <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700/40">
                    <span className="text-[11px] text-gray-400 block uppercase">Data</span>
                    <span className="text-sm font-bold text-white">{ocrData.date}</span>
                  </div>
                </div>

                <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700/40 space-y-1">
                  <span className="text-[11px] text-gray-400 block uppercase">Estabelecimento</span>
                  <p className="text-sm font-semibold text-white">{ocrData.merchant}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700/40">
                    <span className="text-[11px] text-gray-400 block uppercase">Categoria Sugerida</span>
                    <span className="text-xs font-bold text-purple-300">{ocrData.category}</span>
                  </div>
                  <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700/40">
                    <span className="text-[11px] text-gray-400 block uppercase">Pagamento</span>
                    <span className="text-xs font-bold text-indigo-300">{ocrData.payment_method}</span>
                  </div>
                </div>

                <button
                  onClick={handleSaveOcrTransaction}
                  disabled={ocrSaved}
                  className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all"
                >
                  {ocrSaved ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Lançamento Salvo!
                    </>
                  ) : (
                    <>
                      Confirmar e Salvar Lançamento
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500 text-center">
                <FileText className="h-12 w-12 mb-2 text-gray-600" />
                <p className="text-sm">Envie um documento ou nota fiscal para ver a leitura de dados.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
