import { supabase } from '../src/supabaseClient';

export const storageService = {
  // Since bucket is private, we must use signed URLs
  async getSignedUrl(path: string): Promise<string> {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path; // Already a URL
    
    try {
      const { data, error } = await supabase.storage
        .from('app-files')
        .createSignedUrl(path, 3600); // 1 hour validity
        
      if (error) {
        console.error('Error getting signed URL:', error);
        return '';
      }
      return data.signedUrl;
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
    const path = itemId 
      ? `${userId}/${featureName}/${itemId}/${filename}`
      : `${userId}/${featureName}/${filename}`;
    
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
    if (!path || path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return;
    
    try {
      const { error } = await supabase.storage
        .from('app-files')
        .remove([path]);
        
      if (error) console.error('Error deleting file:', error);
    } catch (err) {
      console.error('Failed to delete file from storage:', err);
    }
  },

  async deleteFiles(paths: string[]): Promise<void> {
    if (!paths || !paths.length) return;
    const validPaths = paths.filter(p => p && !p.startsWith('http') && !p.startsWith('blob:') && !p.startsWith('data:'));
    if (!validPaths.length) return;

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
