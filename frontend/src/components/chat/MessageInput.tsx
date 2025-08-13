import { useState, useRef, useCallback } from 'react';
import type { FormEvent, DragEvent, ChangeEvent } from 'react';
import { validateFile, getFileType, formatFileSize, getFileIcon as getFileIconUtil } from '../../utils/fileUpload';

type Props = {
  onSend: (content: string) => void;
  onSendFile: (file: File) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  disabled?: boolean;
};

type FilePreview = {
  id: string;
  file: File;
  preview?: string;
  type: 'image' | 'document' | 'video' | 'other';
};

export default function MessageInput({ onSend, onSendFile, onTypingStart, onTypingStop, disabled = false }: Props) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileTypeFromFile = (file: File): FilePreview['type'] => {
    return getFileType(file);
  };

  const createFilePreview = (file: File): FilePreview => {
    const type = getFileTypeFromFile(file);
    const id = `${file.name}-${Date.now()}`;
    
    let preview: string | undefined;
    if (type === 'image') {
      preview = URL.createObjectURL(file);
    }
    
    return { id, file, preview, type };
  };

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    setUploadError(null);
    
    const validFiles: FilePreview[] = [];
    const errors: string[] = [];
    
    Array.from(selectedFiles).forEach(file => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(createFilePreview(file));
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
    
    if (errors.length > 0) {
      setUploadError(errors.join(', '));
    }
  }, []);

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Send text message if there's text
    const content = text.trim();
    if (content) {
      onSend(content);
      setText('');
    }
    
    // Send files if there are any
    files.forEach(filePreview => {
      onSendFile(filePreview.file);
    });
    
    // Clear files
    setFiles([]);
  };

  const getFileIcon = (type: FilePreview['type']) => {
    switch (type) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'document':
        return '📄';
      default:
        return '📄';
    }
  };

  // formatFileSize is now imported from utils

  return (
    <div className="border-t bg-white">
      {/* Upload Errors */}
      {uploadError && (
        <div className="p-3 border-b bg-red-50 border-red-200">
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}

      {/* File Previews */}
      {files.length > 0 && (
        <div className="p-3 border-b bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {files.map((filePreview) => (
              <div key={filePreview.id} className="relative group">
                {filePreview.type === 'image' && filePreview.preview ? (
                  <div className="relative">
                    <img
                      src={filePreview.preview}
                      alt={filePreview.file.name}
                      className="w-16 h-16 object-cover rounded border"
                    />
                    <button
                      onClick={() => removeFile(filePreview.id)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="relative bg-white border rounded p-2 min-w-[120px]">
                    <div className="flex items-center gap-2">
                      {getFileIcon(filePreview.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{filePreview.file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(filePreview.file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(filePreview.id)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message Input Form */}
      <form onSubmit={handleSubmit} className="p-3">
        <div className="flex items-end gap-2">
          {/* File Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Attach file"
          >
            📎
          </button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,application/*,text/*"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={onTypingStart}
              onBlur={onTypingStop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              placeholder={isDragOver ? "Drop files here..." : "Type a message"}
              disabled={disabled}
              rows={1}
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none resize-none ${
                isDragOver ? 'border-blue-500 bg-blue-50' : ''
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={disabled || (!text.trim() && files.length === 0)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}


