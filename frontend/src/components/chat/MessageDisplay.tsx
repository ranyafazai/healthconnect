import React from 'react';
import type { User } from '../../types/data/user';
import type { Message } from '../../types/data/message';
import { formatDistanceToNow } from 'date-fns';
import { useFileData } from '../../hooks/useFileData';
import { getUploadedFileUrl } from '../../utils/fileUrl';

interface Props {
  message: Message;
  currentUser: User;
  isOwnMessage: boolean;
}

const MessageDisplay: React.FC<Props> = ({ message, currentUser, isOwnMessage }) => {
  // Fetch file data if we have fileId but no file object
  const { file: fetchedFile, loading: fileLoading, error: fileError } = useFileData(
    message.fileId && !message.file ? message.fileId : undefined
  );
  
  // Use fetched file if available, otherwise use message.file
  const file = fetchedFile || message.file;
  
  const renderFileContent = () => {
    if (!file && !message.fileId) return null;

    const fileName = message.content || 'File';

    // If we have file data, render based on type
    if (file) {
      if (message.type === 'IMAGE') {
        return (
          <div className="mt-2">
            <img 
              src={getUploadedFileUrl(file)} 
              alt={fileName}
              className="max-w-xs max-h-64 rounded-lg object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        );
      }

      if (message.type === 'VIDEO') {
        return (
          <div className="mt-2">
            <video 
              src={getUploadedFileUrl(file)} 
              controls
              className="max-w-xs max-h-64 rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            >
              <source src={getUploadedFileUrl(file)} type={file.mimeType} />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      }

      // For other file types, show file info
      return (
        <div className="mt-2 p-3 bg-gray-100 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="text-blue-500">
              {message.type === 'FILE' ? '📄' : '📎'}
            </div>
            <div>
              <div className="font-medium text-sm">{fileName}</div>
              {file.size && (
                <div className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // If we only have fileId (from socket), show loading placeholder
    if (fileLoading) {
      return (
        <div className="mt-2 p-3 bg-gray-100 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="text-gray-400">⏳</div>
            <div>
              <div className="font-medium text-sm">{fileName}</div>
              <div className="text-xs text-gray-500">Loading file...</div>
            </div>
          </div>
        </div>
      );
    }
    
    if (fileError) {
      return (
        <div className="mt-2 p-3 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="text-red-400">❌</div>
            <div>
              <div className="font-medium text-sm">{fileName}</div>
              <div className="text-xs text-red-500">Failed to load file</div>
            </div>
          </div>
        </div>
      );
    }
    
    // If we have fileId but no file data yet, show placeholder
    return (
      <div className="mt-2 p-3 bg-gray-100 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="text-gray-400">📎</div>
          <div>
            <div className="font-medium text-sm">{fileName}</div>
            <div className="text-xs text-gray-500">File</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                 {!isOwnMessage && (
           <div className="text-xs text-gray-500 mb-1">
             {message.sender?.doctorProfile?.firstName || message.sender?.patientProfile?.firstName || 'Unknown'} {' '}
             {message.sender?.doctorProfile?.lastName || message.sender?.patientProfile?.lastName || 'User'}
           </div>
         )}
        
        <div
          className={`px-4 py-2 rounded-lg ${
            isOwnMessage
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-800 border border-gray-200'
          }`}
        >
          {/* Text content */}
          {message.type === 'TEXT' && (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}

          {/* File content */}
          {message.type !== 'TEXT' && renderFileContent()}

          {/* Timestamp */}
          <div className={`text-xs mt-1 ${
            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDisplay;
