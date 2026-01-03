import { FileCategory } from '../../types/file';

export function getFileSize(file: File, decimals: number = 2): string {
  const bytes = file.size;
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = Math.max(decimals, 0);
  const sizes: readonly string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function getFileCategory(file: File): FileCategory {
  const type = file.type;

  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  if (/(pdf|msword|officedocument)/.test(type)) return 'document';

  return 'other';
}

export function createImageUrl(file: File): string | null {
  try {
    return URL.createObjectURL(file);
  } catch {
    return null;
  }
}

export function clearFileInputValue(input: HTMLInputElement | null): void {
  if (input) {
    input.value = '';
  }
}
