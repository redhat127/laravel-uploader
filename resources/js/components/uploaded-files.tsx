// components/uploaded-files.tsx
import { Upload } from '@/types/upload';
import { Download } from 'lucide-react';
import { FilePreview } from './file-preview';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface UploadedFilesProps {
  uploads: Upload[];
}

export const UploadedFiles = ({ uploads }: UploadedFilesProps) => {
  if (uploads.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 text-primary">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {uploads.map((upload) => (
              <div key={upload.id} className="flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <FilePreview mimeType={upload.mime_type || undefined} />

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium">{upload.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{upload.file_size_human}</span>
                      <span>•</span>
                      <span className="truncate">{upload.mime_type || 'Unknown type'}</span>
                      <span>•</span>
                      <span>{upload.created_at_human}</span>
                    </div>
                  </div>
                </div>

                <Button asChild variant="outline" size="sm" className="shrink-0">
                  <a href={upload.download_url}>
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
