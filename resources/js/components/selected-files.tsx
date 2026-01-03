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
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm">Selected Files: ({selectedFiles.length})</p>
          <button type="button" onClick={removeAllFiles} className="flex items-center gap-1 text-sm transition-colors hover:text-red-400">
            <X className="size-4" />
            Clear All
          </button>
        </div>
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
      </CardContent>
    </Card>
  );
};
