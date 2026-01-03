<?php

namespace App\Http\Controllers;

use App\Models\Upload;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function chunk()
    {
        request()->validate([
            'chunk' => ['bail', 'required', 'file', 'max:10240'],
            'chunkIndex' => ['bail', 'required', 'integer', 'min:0'],
            'totalChunks' => ['bail', 'required', 'integer', 'min:1'],
            'originalName' => ['bail', 'required', 'string', 'max:255'],
            'fileIdentifier' => ['bail', 'required', 'string'],
            'checksum' => ['nullable', 'string'],
        ]);

        $chunk = request()->file('chunk');
        $chunkIndex = (int) request()->get('chunkIndex');
        $totalChunks = (int) request()->get('totalChunks');
        $originalName = request()->get('originalName');
        $fileIdentifier = request()->get('fileIdentifier');
        $checksum = request()->get('checksum');

        if ($checksum && md5_file($chunk->getRealPath()) !== $checksum) {
            return response()->json(['error' => 'Chunk corrupted'], 400);
        }

        $metadataPath = 'uploads/'.$fileIdentifier.'.json';

        // Read or create metadata
        $metadataFile = Storage::exists($metadataPath)
            ? json_decode(Storage::get($metadataPath), true)
            : [
                'totalChunks' => $totalChunks,
                'originalName' => $originalName,
                'normalizedName' => $this->normalizeFilename($originalName),
                'expectedNextChunk' => 0,
                'uploadedAt' => now()->toIso8601String(),
            ];

        $normalizedName = $metadataFile['normalizedName']; // Use same normalized name throughout
        $filePath = 'uploads/'.$normalizedName;

        // Verify chunks are coming in order
        if ($chunkIndex !== $metadataFile['expectedNextChunk']) {
            return response()->json([
                'error' => 'Chunks must be uploaded in order',
                'expectedChunk' => $metadataFile['expectedNextChunk'],
                'receivedChunk' => $chunkIndex,
            ], 400);
        }

        // Stream append chunk to file
        $fullPath = Storage::path($filePath);
        $directory = dirname($fullPath);

        if (! file_exists($directory)) {
            mkdir($directory, 0755, true);
        }

        $sourceHandle = fopen($chunk->getRealPath(), 'rb');
        $destinationHandle = fopen($fullPath, 'ab');

        if (! $sourceHandle || ! $destinationHandle) {
            return response()->json(['error' => 'Could not open file handles'], 500);
        }

        stream_copy_to_stream($sourceHandle, $destinationHandle);

        fclose($sourceHandle);
        fclose($destinationHandle);

        // Update expected next chunk
        $metadataFile['expectedNextChunk'] = $chunkIndex + 1;

        // Check if upload complete
        if ($metadataFile['expectedNextChunk'] === $totalChunks) {
            $finalFileSize = filesize($fullPath);
            $mimeType = mime_content_type($fullPath);

            // Save to database - only essentials
            $upload = Upload::create([
                'file_path' => $filePath,
                'mime_type' => $mimeType,
                'file_size' => $finalFileSize,
            ]);

            Storage::delete($metadataPath);

            return response()->json([
                'message' => 'success',
                'completed' => true,
                'filePath' => $filePath,
                'upload' => $upload,
            ]);
        }

        // Save metadata
        Storage::put($metadataPath, json_encode($metadataFile, JSON_PRETTY_PRINT));

        return response()->json([
            'message' => 'chunk uploaded',
            'completed' => false,
            'uploadedChunks' => $chunkIndex + 1,
            'totalChunks' => $totalChunks,
        ]);
    }

    private function normalizeFilename($filename)
    {
        $extension = pathinfo($filename, PATHINFO_EXTENSION);
        $nameWithoutExt = pathinfo($filename, PATHINFO_FILENAME);

        // Replace special chars with underscore, keep letters/numbers/case
        $normalized = preg_replace('/[^A-Za-z0-9_\-]/', '_', $nameWithoutExt);

        // Remove multiple consecutive underscores
        $normalized = preg_replace('/_+/', '_', $normalized);

        // Trim underscores from start/end
        $normalized = trim($normalized, '_');

        // Limit length (leave room for unique suffix)
        $normalized = Str::limit($normalized, 180, '');

        // Add unique identifier (timestamp + random string)
        $unique = time().'_'.Str::random(8);

        // Combine: filename_timestamp_random.ext
        return $normalized.'_'.$unique.'.'.strtolower($extension);
    }

    // Add a cleanup endpoint
    public function abort(Request $request)
    {
        $request->validate([
            'fileIdentifier' => ['bail', 'required', 'string'],
        ]);

        $fileIdentifier = $request->get('fileIdentifier');
        $metadataPath = 'uploads/'.$fileIdentifier.'.json';

        if (Storage::exists($metadataPath)) {
            $metadata = json_decode(Storage::get($metadataPath), true);
            $normalizedName = $metadata['normalizedName'];

            // Delete partial file
            Storage::delete('uploads/'.$normalizedName);

            // Delete metadata
            Storage::delete($metadataPath);
        }

        return response()->json(['message' => 'Upload aborted and cleaned up']);
    }

    public function download(Upload $upload)
    {
        $filePath = Storage::path($upload->file_path);

        if (! file_exists($filePath)) {
            abort(404, 'File not found');
        }

        $fileName = basename($upload->file_path);

        return response()->download($filePath, $fileName, [
            'Content-Type' => $upload->mime_type ?? 'application/octet-stream',
        ]);
    }

    public function destroy(Upload $upload)
    {
        Storage::delete($upload->file_path);
        $upload->delete();

        return back();
    }
}
