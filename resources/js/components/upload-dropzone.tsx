import { cn } from '@/lib/utils/utils';
import { UploadCloud as UploadCloudIcon } from 'lucide-react';
import { DragEvent } from 'react';

interface UploadDropzoneProps {
  isDragging: boolean;
  onClick: () => void;
  onDragEnter: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
}

export const UploadDropzone = ({ isDragging, onClick, onDragEnter, onDragOver, onDragLeave, onDrop }: UploadDropzoneProps) => {
  return (
    <div
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      className={cn(
        'group flex h-48 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed transition-colors *:pointer-events-none hover:border-primary',
        { 'border-blue-600 bg-blue-950/50': isDragging },
      )}
    >
      <h1 className="font-medium">Upload Files</h1>
      <p className="text-sm text-muted-foreground transition-colors group-hover:text-primary">Select or Drag Files Here</p>
      <UploadCloudIcon
        className={cn('-order-1 size-8 transition-all group-hover:-translate-y-1 group-hover:text-sky-500', {
          '-translate-y-1 text-sky-500': isDragging,
        })}
      />
    </div>
  );
};
