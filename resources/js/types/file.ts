export type SelectedFileStatus = 'idle' | 'uploading' | 'completed' | 'error' | 'paused';

export interface SelectedFile {
  id: string;
  status: SelectedFileStatus;
  file: File;
}

export type FileCategory = 'image' | 'video' | 'audio' | 'document' | 'other';

export interface UploadStats {
  bytesUploaded: number;
  speed: number; // bytes per second
  lastChunkTime: number; // timestamp when last chunk completed
}
