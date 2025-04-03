import { storage, appwriteConfig } from './appwrite';

export const getImageUrl = (fileId: string): string => {
    return storage.getFileView(
        appwriteConfig.storageId,
        fileId
    ).toString();
};

export const isValidImageUrl = (url: unknown): boolean => {
    return typeof url === 'string' && url.length > 0 && !url.includes('undefined');
};