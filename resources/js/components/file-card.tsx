import { getFileSize } from '@/lib/utils/file';
import { SelectedFile, UploadStats } from '@/types/file';
import { Pause, Play, X } from 'lucide-react';
import { FilePreview } from './file-preview';
import { Button } from './ui/button';

interface FileCardProps {
  selectedFile: SelectedFile;
  uploadProgress: number;
  uploadStats?: UploadStats;
  onRemove: () => void;
  onPause?: () => void;
  onResume?: () => void;
}

function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond === 0) return '0 B/s';
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const unitIndex = Math.floor(Math.log(bytesPerSecond) / Math.log(1024));
  const speed = bytesPerSecond / Math.pow(1024, unitIndex);
  return `${speed.toFixed(1)} ${units[Math.min(unitIndex, units.length - 1)]}`;
}

function formatTimeRemaining(bytesUploaded: number, totalBytes: number, bytesPerSecond: number): string {
  if (bytesPerSecond === 0) return '--';
  const bytesRemaining = totalBytes - bytesUploaded;
  const secondsRemaining = bytesRemaining / bytesPerSecond;

  if (secondsRemaining < 60) return `${Math.ceil(secondsRemaining)}s left`;
  if (secondsRemaining < 3600) return `${Math.ceil(secondsRemaining / 60)}m left`;
  return `${Math.ceil(secondsRemaining / 3600)}h left`;
}

export const FileCard = ({ selectedFile, uploadProgress, uploadStats, onRemove, onPause, onResume }: FileCardProps) => {
  const isPausable = selectedFile.status === 'uploading';
  const isResumable = selectedFile.status === 'paused';

  const uploadedSize = uploadStats ? getFileSize({ size: uploadStats.bytesUploaded } as File) : '0 B';
  const totalSize = getFileSize(selectedFile.file);
  const speed = uploadStats ? formatSpeed(uploadStats.speed) : null;
  const timeRemaining = uploadStats ? formatTimeRemaining(uploadStats.bytesUploaded, selectedFile.file.size, uploadStats.speed) : null;

  return (
    <div className="flex items-center gap-4 rounded-md border p-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <FilePreview file={selectedFile.file} />
        <div className="mt-2 w-full min-w-0 space-y-1">
          <h2 className="truncate text-sm font-medium">{selectedFile.file.name}</h2>
          <p className="text-xs text-muted-foreground">
            {uploadedSize} / {totalSize}
            {speed && <span className="ml-2 text-blue-400">{speed}</span>}
            {timeRemaining && <span className="ml-2 text-muted-foreground">{timeRemaining}</span>}
          </p>

          {selectedFile.status === 'uploading' && (
            <div className="mt-2 flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between">
                <span>Uploading</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-md bg-white/10">
                <div className="h-full rounded-md bg-blue-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {selectedFile.status === 'paused' && (
            <div className="mt-2 flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between">
                <span>Paused</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-md bg-white/10">
                <div className="h-full rounded-md bg-yellow-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {selectedFile.status === 'completed' && <div className="mt-2 text-xs text-green-600">Uploaded</div>}

          {selectedFile.status === 'error' && <div className="mt-2 text-xs text-red-600">Upload failed</div>}

          {selectedFile.status === 'idle' && <div className="mt-2 text-xs text-muted-foreground">Ready</div>}
        </div>
      </div>

      <div className="flex gap-2">
        {isPausable && (
          <Button variant="outline" size="icon-sm" onClick={onPause}>
            <Pause className="size-4" />
          </Button>
        )}
        {isResumable && (
          <Button variant="outline" size="icon-sm" onClick={onResume}>
            <Play className="size-4" />
          </Button>
        )}
        <Button variant="outline" size="icon-sm" onClick={onRemove}>
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
};
