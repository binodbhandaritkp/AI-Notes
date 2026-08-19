import { supabase } from '../src/supabaseClient';

export interface UploadFileOptions {
  file: File;
  userId: string;
  featureName: string;
  itemId: string;
  customName?: string;
}

export const storageService = {
  // १. Signed URL लिने function (१ घण्टाको लागि)
  async getSignedUrl(path: string): Promise<string> {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('blob:')) return path; // Already a URL

    const { data, error } = await supabase.storage
      .from('app-files')
      .createSignedUrl(path, 3600); // 1 hour validity

    if (error) {
      console.error('Error getting signed URL:', error);
      return '';
    }
    return data.signedUrl;
  },

  // २. Strict Path Standard: ${userId}/${featureName}/${itemId}/${uuid}.${extension} अनुसार Upload गर्ने
  async uploadFile({
    file,
    userId,
    featureName,
    itemId,
    customName,
  }: UploadFileOptions): Promise<string> {
    // Extension निकालिने (जस्तै: png, jpg, pdf)
    const extension = file.name.split('.').pop() || 'bin';

    // customName नभए crypto.randomUUID() बाट Unique ID बनाइन्छ
    const fileName = customName
      ? customName
      : `${crypto.randomUUID()}.${extension}`;

    // Exactly requirement अनुसारको Path Build गरिने
    const path = `${userId}/${featureName}/${itemId}/${fileName}`;

    const { error } = await supabase.storage
      .from('app-files')
      .upload(path, file, {
        upsert: true,
        cacheControl: '3600',
      });

    if (error) throw error;
    return path; // Database मा सेभ गर्नको लागि Relative Path Return गर्छ
  },

  // ३. एकल फाइल डिलिट गर्ने
  async deleteFile(path: string): Promise<void> {
    if (!path || path.startsWith('http')) return;

    const { error } = await supabase.storage
      .from('app-files')
      .remove([path]);

    if (error) console.error('Error deleting file:', error);
  },

  // ४. एकभन्दा बढी फाइल एकैपटक डिलिट गर्ने
  async deleteFiles(paths: string[]): Promise<void> {
    if (!paths.length) return;
    const validPaths = paths.filter((p) => p && !p.startsWith('http'));
    if (!validPaths.length) return;

    const { error } = await supabase.storage
      .from('app-files')
      .remove(validPaths);

    if (error) console.error('Error deleting files:', error);
  },
};
