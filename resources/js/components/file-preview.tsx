import { createImageUrl, getFileCategory } from '@/lib/utils/file';
import { File as FileIcon, Film as FilmIcon, Image as ImageIcon, Music as MusicIcon } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

interface FilePreviewProps {
  file: File;
}

export const FilePreview = ({ file }: FilePreviewProps) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>();
  const fileType = getFileCategory(file);

  useEffect(() => {
    if (fileType === 'image') {
      const url = createImageUrl(file);
      if (url) {
        setImagePreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      }
    }
  }, [file, fileType]);

  const iconClassName = 'h-full w-full stroke-1 text-purple-400';

  const getPreviewContent = (): ReactNode => {
    switch (fileType) {
      case 'video':
        return <FilmIcon className={iconClassName} />;
      case 'audio':
        return <MusicIcon className={iconClassName} />;
      case 'image':
        return imagePreviewUrl ? (
          <img src={imagePreviewUrl} alt={`${file.name} preview`} className="h-full w-full rounded-sm object-cover" />
        ) : (
          <ImageIcon className={iconClassName} />
        );
      default:
        return <FileIcon className={iconClassName} />;
    }
  };

  return <div className="h-16 w-16 min-w-16 rounded-md border p-1">{getPreviewContent()}</div>;
};
