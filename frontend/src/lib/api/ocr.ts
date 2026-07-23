import { useMutation, useQuery } from "@tanstack/react-query";
import { apiGet, apiPost } from "./client";

export interface OCRUploadResponse {
  id: string;
  filename: string;
  status: string;
}

export interface OCRResultResponse {
  id: string;
  status: string;
  extracted_data?: Record<string, unknown>;
  [key: string]: unknown;
}

export function useOCRUpload() {
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return apiPost<OCRUploadResponse>("/ocr/upload", fd);
    },
  });
}

export function useOCRResult(documentId: string | null) {
  return useQuery({
    queryKey: ["ocr", documentId],
    queryFn: () => apiGet<OCRResultResponse>(`/ocr/${documentId}`),
    enabled: !!documentId,
    refetchInterval: (q) => (q.state.data?.status === "processing" ? 2000 : false),
  });
}
