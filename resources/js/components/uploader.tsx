import axios from 'axios';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useFileSelection } from './hooks/use-file-selection';
import { useDragAndDrop } from './hooks/use-files-drag-drop';
import { SelectedFiles } from './selected-files';
import { Card, CardContent } from './ui/card';
import { UploadDropzone } from './upload-dropzone';

export const Uploader = () => {
  const {
    selectedFiles,
    inputFileRef,
    addFiles,
    removeFile,
    removeAllFiles,
    sendFile,
    handleFileInputChange,
    openFileDialog,
    uploadProgress,
    uploadStats,
    pauseUpload,
    resumeUpload,
  } = useFileSelection();

  const { isDragging, onDragEnter, onDragOver, onDragLeave, onDrop } = useDragAndDrop(addFiles);

  useEffect(() => {
    if (!selectedFiles.length) return;

    const filesToUpload = selectedFiles.filter((sf) => sf.status === 'idle');

    if (!filesToUpload.length) return;

    Promise.all(filesToUpload.map((selectedFile) => sendFile(selectedFile)))
      .then((filePaths) => {
        const completedFiles = filePaths.filter((path): path is string => path != null);
        if (completedFiles.length > 0) {
          toast.success(`All ${completedFiles.length} files uploaded successfully!`);
        }
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          toast.error('Some uploads failed');
        }
      });
  }, [selectedFiles, sendFile]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 text-primary sm:space-y-6">
      <Card className="p-0">
        <CardContent className="p-4 sm:p-6">
          <UploadDropzone
            isDragging={isDragging}
            onClick={openFileDialog}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          />
          <input type="file" className="hidden" ref={inputFileRef} onChange={handleFileInputChange} multiple />
        </CardContent>
      </Card>

      {selectedFiles.length > 0 && (
        <SelectedFiles
          selectedFiles={selectedFiles}
          removeAllFiles={removeAllFiles}
          removeFile={removeFile}
          uploadProgress={uploadProgress}
          uploadStats={uploadStats}
          onPause={pauseUpload}
          onResume={resumeUpload}
        />
      )}
    </div>
  );
};
