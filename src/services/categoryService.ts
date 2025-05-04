import { ID, Query, Models } from "appwrite";
import { databases, appwriteConfig } from "@/src/lib/appwrite";

export interface AppwriteCategory extends Models.Document {
  name: string;
  icon: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  imageSrc: string;
}

// Convert Appwrite category to local format
export const appwriteToLocalCategory = (
  category: AppwriteCategory
): Category => {
  return {
    id: category.$id, // Use the Appwrite document ID
    name: category.name,
    icon: category.icon || "✨",
    imageSrc: `/icons/${category.name.toLowerCase().replace(/\s+/g, "-")}.png`,
  };
};

// Convert local category to Appwrite format
export const localToAppwriteCategory = (
  category: Category
): Omit<AppwriteCategory, "$id"> => {
  return {
    name: category.name,
    icon: category.icon,
  };
};

// Fetch all categories from Appwrite
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      [Query.orderAsc("name")]
    );

    return response.documents.map((doc) =>
      appwriteToLocalCategory(doc as unknown as AppwriteCategory)
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

// Add a new category to Appwrite
export const addCategory = async (
  category: Omit<Category, "id" | "imageSrc">
): Promise<Category | null> => {
  try {
    // Check if category already exists
    const existingCategories = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      [Query.equal("name", category.name)]
    );

    if (existingCategories.documents.length > 0) {
      console.log("Category already exists:", category.name);
      return appwriteToLocalCategory(
        existingCategories.documents[0] as unknown as AppwriteCategory
      );
    }

    // Create new category
    const newCategory = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      ID.unique(),
      {
        name: category.name,
        icon: category.icon,
      }
    );

    return appwriteToLocalCategory(newCategory as unknown as AppwriteCategory);
  } catch (error) {
    console.error("Error adding category:", error);
    return null;
  }
};

// Update an existing category in Appwrite
export const updateCategory = async (
  id: string,
  category: Partial<Omit<Category, "id" | "imageSrc">>
): Promise<Category | null> => {
  try {
    const updatedCategory = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      id,
      {
        name: category.name,
        icon: category.icon,
      }
    );

    return appwriteToLocalCategory(
      updatedCategory as unknown as AppwriteCategory
    );
  } catch (error) {
    console.error("Error updating category:", error);
    return null;
  }
};

// Delete a category from Appwrite
export const deleteCategory = async (id: string): Promise<boolean> => {
  console.log(`Attempting to delete category with ID: ${id}`);
  console.log(`Database ID: ${appwriteConfig.databaseId}`);
  console.log(`Collection ID: ${appwriteConfig.categoriesCollectionId}`);

  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      id
    );

    console.log(`Successfully deleted category with ID: ${id}`);
    return true;
  } catch (error) {
    console.error("Error deleting category:", error);
    return false;
  }
};

// Upload initial categories to Appwrite
export const uploadInitialCategories = async (
  categories: Category[]
): Promise<void> => {
  try {
    for (const category of categories) {
      await addCategory({
        name: category.name,
        icon: category.icon,
      });
    }
    console.log("Initial categories uploaded successfully");
  } catch (error) {
    console.error("Error uploading initial categories:", error);
  }
};
