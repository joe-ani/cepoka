# Appwrite Troubleshooting Guide

This guide provides steps to troubleshoot common issues with Appwrite integration in the Cepoka stock management system.

## Common Issues and Solutions

### 1. Connection Issues

**Symptoms:**

- "Failed to connect to Appwrite" error
- Network errors in the console

**Solutions:**

- Check your internet connection
- Verify that Appwrite cloud services are up (check status.appwrite.io)
- Make sure you're using the correct endpoint (https://cloud.appwrite.io/v1)

### 2. Authentication Issues

**Symptoms:**

- "Unauthorized" errors
- Permission denied errors

**Solutions:**

- Verify that your project ID is correct in `appwrite.ts` (should be: 67d07dc9000bafdd5d81)
- Check that you're logged in to Appwrite (if using authenticated routes)
- Verify that your API keys have the correct permissions

### 3. Collection/Database Not Found

**Symptoms:**

- "Collection not found" errors
- 404 errors when trying to access collections

**Solutions:**

- Verify that the database ID is correct in `appwrite.ts`
- Verify that the collection ID is correct in `appwrite.ts`
- Check if the collection exists in the Appwrite console
- Create the collection if it doesn't exist

### 4. Document Creation Failures

**Symptoms:**

- Errors when trying to create documents
- Validation errors

**Solutions:**

- Check that all required attributes are defined in the collection
- Verify that the data you're sending matches the attribute types
- Check for any size limits on string attributes
- Make sure JSON attributes are properly formatted

## Specific Fixes for Stock Products Collection

### Creating the Stock Products Collection Manually

If the collection doesn't exist, you can create it manually in the Appwrite console:

1. Go to your Appwrite console
2. Navigate to Databases > Your Database
3. Click "Create Collection"
4. Set the Collection ID to: `681a651d001cc3de8395`
5. Set the Collection Name to: "Stock Products"
6. Set appropriate permissions (e.g., allow read/write for all users)
7. Click "Create"

### Adding Required Attributes

After creating the collection, add these attributes:

1. **name** (String)

   - Type: String
   - Required: Yes
   - Size: 255
   - Default: None

2. **stockMovements** (JSON)

   - Type: JSON
   - Required: Yes
   - Default: `[]` (empty array)

3. **lastUpdated** (String)
   - Type: String
   - Required: Yes
   - Size: 255
   - Default: None

## Checking Console Logs

The application has been updated with detailed logging. To troubleshoot:

1. Open your browser's developer console (F12 or right-click > Inspect > Console)
2. Look for logs starting with "Testing Appwrite connection with:"
3. Check for any error messages or codes
4. Use the information to identify the specific issue

## Common Error Codes

- **401**: Unauthorized - Check your project ID and authentication
- **404**: Not Found - Collection or database doesn't exist
- **400**: Bad Request - Invalid data format
- **409**: Conflict - Document ID already exists
- **500**: Server Error - Issue with Appwrite servers

## Verifying Configuration

Make sure your `appwrite.ts` file has the correct configuration:

```typescript
export const appwriteConfig = {
  databaseId: "6813eadb003e7d64f63c", // Confirmed correct database ID
  productsCollectionId: "6813eaf40036e52c29b1",
  categoriesCollectionId: "6817640f000dd0b67c77",
  stockProductsCollectionId: "681a651d001cc3de8395",
  stockMovementsCollectionId: "681bddcc000204a3748d",
  storageId: "6813ea36001624c1202a",
};
```

## Testing the Connection

The application now includes a connection test function that runs before creating a stock product. This will help identify issues with your Appwrite configuration.

If you continue to experience issues, check the browser console for detailed error messages and use them to troubleshoot the specific problem.

## Getting Help

If you're still having issues:

1. Check the Appwrite documentation: https://appwrite.io/docs
2. Visit the Appwrite Discord community: https://discord.gg/appwrite
3. Search for similar issues on Stack Overflow
4. Contact Appwrite support through their website
