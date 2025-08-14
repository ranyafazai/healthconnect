import { useState, useEffect } from 'react';
import axios from '../lib/axios';
import type { File } from '../types/data/file';

export function useFileData(fileId: number | undefined) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileId) {
      setFile(null);
      return;
    }

    const fetchFile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`/files/${fileId}`);
        setFile(response.data?.data || null);
      } catch (err) {
        console.error('Failed to fetch file:', err);
        setError('Failed to load file');
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [fileId]);

  return { file, loading, error };
}
