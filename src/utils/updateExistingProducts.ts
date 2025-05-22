import { databases, appwriteConfig } from '@/src/lib/appwrite';
import { CATEGORIES } from '@/src/data/categories';
import { Query } from 'appwrite';

/**
 * Utility function to update existing products in the database
 * to include the category name based on the category ID
 */
export const updateExistingProducts = async () => {
  try {
    console.log('Starting to update existing products...');
    
    // Fetch all products from Appwrite
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.productsCollectionId,
      [Query.limit(100)] // Increase limit to get more products
    );
    
    const products = response.documents;
    console.log(`Found ${products.length} products to update`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    // Update each product
    for (const product of products) {
      try {
        // Skip products that already have a categoryName
        if (product.categoryName) {
          console.log(`Product ${product.name} already has categoryName: ${product.categoryName}`);
          continue;
        }
        
        // Find the category name from the category ID
        const categoryId = product.category;
        const category = CATEGORIES.find(cat => cat.id === categoryId);
        
        if (category) {
          // Update the product with the category name
          await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.productsCollectionId,
            product.$id,
            {
              categoryName: category.name
            }
          );
          
          console.log(`✅ Updated product ${product.name} with category name: ${category.name}`);
          updatedCount++;
        } else {
          console.log(`❌ Could not find category for product ${product.name} with category ID: ${categoryId}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`Error updating product ${product.name}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Update complete. Updated ${updatedCount} products. Errors: ${errorCount}`);
    return { success: true, updatedCount, errorCount };
  } catch (error) {
    console.error('Error updating products:', error);
    return { success: false, error };
  }
};
