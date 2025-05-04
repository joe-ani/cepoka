import { CATEGORIES } from '@/src/data/categories';
import { uploadInitialCategories } from '@/src/services/categoryService';

// This function can be called from the admin page or a dedicated utility page
export const initializeCategories = async () => {
  try {
    await uploadInitialCategories(CATEGORIES);
    return { success: true, message: 'Categories uploaded successfully' };
  } catch (error) {
    console.error('Error initializing categories:', error);
    return { success: false, message: 'Failed to upload categories' };
  }
};
