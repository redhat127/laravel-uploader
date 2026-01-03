// components/uploaded-files.tsx
import { Upload } from '@/types/upload';
import { router } from '@inertiajs/react';
import { Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { FilePreview } from './file-preview';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface UploadedFilesProps {
  uploads: Upload[];
}

export const UploadedFiles = ({ uploads }: UploadedFilesProps) => {
  const handleDelete = (upload: Upload) => {
    if (confirm('Are you sure you want to delete this file?')) {
      router.delete(upload.delete_url, {
        preserveScroll: true,
        preserveState: 'errors',
        onSuccess: () => {
          toast.success('File deleted successfully');
        },
        onError: () => {
          toast.error('Failed to delete file');
        },
      });
    }
  };

  if (uploads.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 text-primary sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {uploads.map((upload) => (
              <div
                key={upload.id}
                className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <FilePreview mimeType={upload.mime_type || undefined} />

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium">{upload.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span className="truncate">{upload.file_size_human}</span>
                      <span>•</span>
                      <span className="truncate">{upload.mime_type || 'Unknown type'}</span>
                      <span>•</span>
                      <span className="truncate">{upload.created_at_human}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="icon-sm" className="shrink-0">
                    <a href={upload.download_url} aria-label="Download">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="shrink-0 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(upload)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
