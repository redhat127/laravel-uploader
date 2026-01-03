// types/upload.ts
export interface Upload {
  id: string;
  name: string;
  mime_type: string | null;
  file_size: number;
  file_size_human: string;
  download_url: string;
  created_at: string;
  created_at_human: string;
}
