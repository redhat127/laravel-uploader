import { SelectedFile, UploadStats } from '@/types/file';
import { X } from 'lucide-react';
import { FileCard } from './file-card';
import { Card, CardContent } from './ui/card';

interface SelectedFilesProps {
  selectedFiles: SelectedFile[];
  removeAllFiles: () => void;
  removeFile: (fileId: string) => void;
  uploadProgress: Record<string, number>;
  uploadStats: Record<string, UploadStats>;
  onPause: (fileId: string) => void;
  onResume: (fileId: string) => void;
}

export const SelectedFiles = ({ selectedFiles, removeAllFiles, removeFile, uploadProgress, uploadStats, onPause, onResume }: SelectedFilesProps) => {
  return (
    <Card className="p-0">
      <CardContent className="space-y-3 p-4 sm:space-y-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">Selected Files: ({selectedFiles.length})</p>
          <button type="button" onClick={removeAllFiles} className="flex items-center gap-1 text-sm transition-colors hover:text-red-400">
            <X className="size-4" />
            Clear All
          </button>
        </div>
        <div className="space-y-3">
          {selectedFiles.map((selectedFile) => (
            <FileCard
              key={selectedFile.id}
              selectedFile={selectedFile}
              onRemove={() => removeFile(selectedFile.id)}
              uploadProgress={uploadProgress[selectedFile.id] || 0}
              uploadStats={uploadStats[selectedFile.id]}
              onPause={() => onPause(selectedFile.id)}
              onResume={() => onResume(selectedFile.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
