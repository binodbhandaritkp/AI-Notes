import { supabase } from '../src/supabaseClient';

interface CachedUrl {
  url: string;
  expiresAt: number;
}

const signedUrlCache = new Map<string, CachedUrl>();

// Helper to sanitize paths
const sanitizePath = (path: string): string => {
  if (!path || typeof path !== 'string') return '';
  return path.trim().replace(/^\/+/, '');
};

// Helper to determine if a string is already a direct/resolvable URL
const isDirectUrl = (path: string): boolean => {
  if (!path || typeof path !== 'string') return false;
  const trimmed = path.trim();
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  );
};

export const storageService = {
  // Since bucket is private, we must use signed URLs
  async getSignedUrl(path: string): Promise<string> {
    if (!path || typeof path !== 'string') return '';
    const cleanPath = sanitizePath(path);
    if (!cleanPath) return '';
    
    if (isDirectUrl(cleanPath)) return cleanPath; // Already a full or blob URL
    
    // Check in-memory cache
    const now = Date.now();
    const cached = signedUrlCache.get(cleanPath);
    if (cached && cached.expiresAt > now) {
      return cached.url;
    }

    try {
      const { data, error } = await supabase.storage
        .from('app-files')
        .createSignedUrl(cleanPath, 3600); // 1 hour validity
        
      if (error) {
        console.error('Error getting signed URL for:', cleanPath, error);
        return '';
      }

      if (data?.signedUrl) {
        // Cache for 50 minutes (leaving 10 min buffer before the 60 min token expires)
        signedUrlCache.set(cleanPath, {
          url: data.signedUrl,
          expiresAt: now + 50 * 60 * 1000
        });
        return data.signedUrl;
      }
      return '';
    } catch (err) {
      console.error('Failed to create signed URL:', err);
      return '';
    }
  },

  /**
   * Upload file to Supabase Storage under ${userId}/${featureName}/${itemId}/${uuid}.${extension}
   * or ${userId}/${featureName}/${uuid}.${extension}
   */
  async uploadFile(
    file: File, 
    userId: string, 
    featureName: string, 
    itemId?: string,
    customFilename?: string
  ): Promise<string> {
    if (!userId) throw new Error('User ID is required for storage operations');

    // Extract clean file extension
    const originalName = file.name || 'file';
    const extension = originalName.includes('.') ? originalName.split('.').pop()?.toLowerCase() : 'bin';
    
    // Generate unique ID
    const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const filename = customFilename 
      ? customFilename 
      : `${uniqueId}.${extension}`;

    // Structure: ${userId}/${featureName}/${itemId}/${filename} or ${userId}/${featureName}/${filename}
    const rawPath = itemId 
      ? `${userId}/${featureName}/${itemId}/${filename}`
      : `${userId}/${featureName}/${filename}`;
    
    const path = sanitizePath(rawPath);

    const { error } = await supabase.storage
      .from('app-files')
      .upload(path, file, { 
        upsert: true,
        cacheControl: '3600'
      });

    if (error) throw error;
    return path;
  },

  async deleteFile(path: string): Promise<void> {
    if (!path || isDirectUrl(path)) return;
    const cleanPath = sanitizePath(path);
    if (!cleanPath) return;
    
    signedUrlCache.delete(cleanPath);

    try {
      const { error } = await supabase.storage
        .from('app-files')
        .remove([cleanPath]);
        
      if (error) console.error('Error deleting file:', error);
    } catch (err) {
      console.error('Failed to delete file from storage:', err);
    }
  },

  async deleteFiles(paths: string[]): Promise<void> {
    if (!paths || !paths.length) return;
    const validPaths = paths
      .map(sanitizePath)
      .filter(p => p && !isDirectUrl(p));

    if (!validPaths.length) return;

    validPaths.forEach(p => signedUrlCache.delete(p));

    try {
      const { error } = await supabase.storage
        .from('app-files')
        .remove(validPaths);
        
      if (error) console.error('Error deleting files:', error);
    } catch (err) {
      console.error('Failed to delete files from storage:', err);
    }
  }
};
