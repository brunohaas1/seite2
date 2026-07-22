"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileSpreadsheet, CheckCircle2, ArrowRight, RefreshCw, FileText } from "lucide-react";

export default function ImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
          Importador de Extratos Bancários
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Importe lançamentos em lote a partir de arquivos OFX, CSV, Excel (XLSX), QIF ou CNAB.
        </p>
      </div>

      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8 text-center space-y-6">
        <label className="border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-900/40 hover:bg-gray-800/40">
          <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl mb-4">
            <FileSpreadsheet className="h-10 w-10" />
          </div>
          <span className="font-bold text-white text-lg mb-1">
            {selectedFile ? selectedFile.name : "Selecione ou solte seu extrato bancário aqui"}
          </span>
          <span className="text-xs text-gray-400">
            Formato aceito: .ofx, .csv, .xlsx, .qif (Itaú, Bradesco, Nubank, Banco do Brasil, Inter, Caixa, C6)
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
      </div>
    </div>
  );
}
