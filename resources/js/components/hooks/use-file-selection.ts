import UploadController from '@/actions/App/Http/Controllers/UploadController';
import { clearFileInputValue } from '@/lib/utils/file';
import { SelectedFile, SelectedFileStatus, UploadStats } from '@/types/file';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { ChangeEvent, useRef, useState } from 'react';
import { toast } from 'sonner';

const CHUNK_SIZE = 1024 * 1024 * 2; // 2MB

export function useFileSelection() {
  const {
    props: { csrfToken },
  } = usePage<{ csrfToken: string }>();

  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadStats, setUploadStats] = useState<Record<string, UploadStats>>({});
  const abortControllersRef = useRef<Record<string, AbortController>>({});
  const pausedFileIdsRef = useRef<Set<string>>(new Set());
  const chunkStartTimeRef = useRef<Record<string, number>>({});
  const inputFileRef = useRef<HTMLInputElement>(null);

  const updateFileProgress = (fileId: string, progress: number) => {
    setUploadProgress((prev) => ({ ...prev, [fileId]: progress }));
  };

  const addFiles = (files: File[]) => {
    const filesWithIds: SelectedFile[] = files.map((file) => ({
      id: nanoid(),
      status: 'idle',
      file: file,
    }));

    setSelectedFiles((prevFiles) => {
      const newFiles = filesWithIds.filter((newFile) => !prevFiles.some((prevFile) => prevFile.file.name === newFile.file.name));
      return [...prevFiles, ...newFiles];
    });

    clearFileInputValue(inputFileRef.current);
  };

  const updateFileStatus = (fileId: string, status: SelectedFileStatus) => {
    setSelectedFiles((prevFiles) => prevFiles.map((selectedFile) => (selectedFile.id === fileId ? { ...selectedFile, status } : selectedFile)));
  };

  const sendFile = async (selectedFile: SelectedFile) => {
    const file = selectedFile.file;
    const totalSize = file.size;
    const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);

    const abortController = new AbortController();
    abortControllersRef.current[selectedFile.id] = abortController;

    updateFileStatus(selectedFile.id, 'uploading');

    let chunkIndex = 0;

    while (chunkIndex < totalChunks) {
      if (pausedFileIdsRef.current.has(selectedFile.id)) {
        updateFileStatus(selectedFile.id, 'paused');
        delete abortControllersRef.current[selectedFile.id];
        return;
      }

      const start = chunkIndex * CHUNK_SIZE;
      const end = start + CHUNK_SIZE;
      const chunk = file.slice(start, Math.min(end, totalSize));

      const formData = new FormData();
      formData.set('chunk', chunk);
      formData.set('chunkIndex', chunkIndex.toString());
      formData.set('totalChunks', totalChunks.toString());
      formData.set('originalName', file.name);
      formData.set('fileIdentifier', selectedFile.id);

      chunkStartTimeRef.current[selectedFile.id] = Date.now();

      try {
        const res = await axios.post(UploadController.chunk.url(), formData, {
          headers: { 'x-csrf-token': csrfToken },
          signal: abortController.signal,
        });

        const progress = Math.round((res.data.uploadedChunks / res.data.totalChunks) * 100);
        updateFileProgress(selectedFile.id, progress);

        const now = Date.now();
        const lastChunkTime = chunkStartTimeRef.current[selectedFile.id];
        const chunkDuration = (now - lastChunkTime) / 1000;
        const chunkSpeed = chunkDuration > 0 ? CHUNK_SIZE / chunkDuration : CHUNK_SIZE;
        const currentStats = uploadStats[selectedFile.id];
        const smoothedSpeed = currentStats ? currentStats.speed * 0.9 + chunkSpeed * 0.1 : chunkSpeed;
        setUploadStats((prev) => ({
          ...prev,
          [selectedFile.id]: {
            bytesUploaded: chunkIndex * CHUNK_SIZE,
            speed: smoothedSpeed,
            lastChunkTime: now,
          },
        }));

        if (res.data.completed) {
          updateFileStatus(selectedFile.id, 'completed');
          delete abortControllersRef.current[selectedFile.id];
          setUploadStats((prev) => {
            const newStats = { ...prev };
            delete newStats[selectedFile.id];
            return newStats;
          });
          toast.success(`${file.name} uploaded successfully!`);
          return res.data.filePath;
        }

        chunkIndex++;
      } catch (error) {
        if (axios.isAxiosError(error) && axios.isCancel(error)) {
          if (pausedFileIdsRef.current.has(selectedFile.id)) {
            updateFileStatus(selectedFile.id, 'paused');
            delete abortControllersRef.current[selectedFile.id];
            return;
          }
          updateFileStatus(selectedFile.id, 'idle');
          updateFileProgress(selectedFile.id, 0);
          toast.info(`Upload cancelled: ${file.name}`);
        } else if (axios.isAxiosError(error) && error.response?.status === 400 && error.response?.data?.expectedChunk !== undefined) {
          const expectedChunk = error.response.data.expectedChunk;
          if (expectedChunk > chunkIndex) {
            chunkIndex = expectedChunk;
            continue;
          }
        } else {
          updateFileStatus(selectedFile.id, 'error');
          toast.error(`Failed to upload ${file.name}`);
          setUploadStats((prev) => {
            const newStats = { ...prev };
            delete newStats[selectedFile.id];
            return newStats;
          });
        }
        delete abortControllersRef.current[selectedFile.id];
        throw error;
      }
    }
  };

  const pauseUpload = (fileId: string) => {
    const abortController = abortControllersRef.current[fileId];
    if (abortController) {
      abortController.abort();
    }
    pausedFileIdsRef.current.add(fileId);
    updateFileStatus(fileId, 'paused');
  };

  const resumeUpload = (fileId: string) => {
    pausedFileIdsRef.current.delete(fileId);
    const file = selectedFiles.find((f) => f.id === fileId);
    if (file) {
      updateFileStatus(fileId, 'uploading');
      sendFile(file);
    }
  };

  const abortUpload = (fileId: string) => {
    const abortController = abortControllersRef.current[fileId];
    if (abortController) {
      abortController.abort();
    }
    delete abortControllersRef.current[fileId];
  };

  const cleanupBackend = (fileId: string) => {
    axios.post(UploadController.abort.url(), { fileIdentifier: fileId }, { headers: { 'x-csrf-token': csrfToken } }).catch(() => {});
  };

  const removeFile = (fileId: string) => {
    const wasPaused = pausedFileIdsRef.current.has(fileId);
    if (wasPaused) {
      pausedFileIdsRef.current.delete(fileId);
      updateFileStatus(fileId, 'idle');
      updateFileProgress(fileId, 0);
      toast.info(`Upload cancelled: ${selectedFiles.find((f) => f.id === fileId)?.file.name}`);
    }
    abortUpload(fileId);
    cleanupBackend(fileId);
    setSelectedFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
    setUploadStats((prev) => {
      const newStats = { ...prev };
      delete newStats[fileId];
      return newStats;
    });
    delete chunkStartTimeRef.current[fileId];
    clearFileInputValue(inputFileRef.current);
  };

  const removeAllFiles = () => {
    const allFileIds = new Set([...Object.keys(abortControllersRef.current), ...Array.from(pausedFileIdsRef.current)]);

    allFileIds.forEach((fileId) => {
      abortUpload(fileId);
      cleanupBackend(fileId);
    });

    pausedFileIdsRef.current = new Set();
    setSelectedFiles([]);
    setUploadProgress({});
    setUploadStats({});
    chunkStartTimeRef.current = {};
    abortControllersRef.current = {};
    clearFileInputValue(inputFileRef.current);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      addFiles(Array.from(files));
    }
  };

  const openFileDialog = () => {
    inputFileRef.current?.click();
  };

  return {
    selectedFiles,
    inputFileRef,
    addFiles,
    removeFile,
    removeAllFiles,
    handleFileInputChange,
    openFileDialog,
    sendFile,
    uploadProgress,
    uploadStats,
    pauseUpload,
    resumeUpload,
  };
}
