import { createImageUrl, getFileCategory } from '@/lib/utils/file';
import { File as FileIcon, Film as FilmIcon, Image as ImageIcon, Music as MusicIcon } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

interface FilePreviewProps {
  file?: File; // For local files being uploaded
  mimeType?: string; // For uploaded files from database
  filePath?: string; // For uploaded files from database (for image previews)
}

export const FilePreview = ({ file, mimeType, filePath }: FilePreviewProps) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>();

  // Determine file type from either File object or mime type string
  const fileType = file ? getFileCategory(file) : mimeType ? getFileCategoryFromMimeType(mimeType) : 'other';

  useEffect(() => {
    if (fileType === 'image') {
      if (file) {
        // Local file preview
        const url = createImageUrl(file);
        if (url) {
          setImagePreviewUrl(url);
          return () => URL.revokeObjectURL(url);
        }
      } else if (filePath) {
        // Uploaded file from server
        setImagePreviewUrl(filePath);
      }
    }
  }, [file, filePath, fileType]);

  const iconClassName = 'h-full w-full stroke-1 text-purple-400';

  const getPreviewContent = (): ReactNode => {
    switch (fileType) {
      case 'video':
        return <FilmIcon className={iconClassName} />;
      case 'audio':
        return <MusicIcon className={iconClassName} />;
      case 'image':
        return imagePreviewUrl ? (
          <img src={imagePreviewUrl} alt="File preview" className="h-full w-full rounded-sm object-cover" />
        ) : (
          <ImageIcon className={iconClassName} />
        );
      default:
        return <FileIcon className={iconClassName} />;
    }
  };

  return <div className="h-16 w-16 min-w-16 rounded-md border p-1">{getPreviewContent()}</div>;
};

// Helper function to work with mime type strings
function getFileCategoryFromMimeType(mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'other' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (/(pdf|msword|officedocument)/.test(mimeType)) return 'document';
  return 'other';
}
