# Appwrite Attributes Setup for Stock Management System

This guide provides step-by-step instructions for setting up the required attributes in your Appwrite collections for the stock management system.

## Stock Products Collection (ID: 681a651d001cc3de8395)

### Required Attributes

1. **name** (String)

   - Type: String
   - Required: Yes
   - Default: None
   - Array: No
   - Description: The name of the stock product

2. **stockMovements** (JSON)

   - Type: JSON
   - Required: Yes
   - Default: `[]` (empty array)
   - Description: An array of stock movement objects

3. **lastUpdated** (String)

   - Type: String
   - Required: Yes
   - Default: Current date in ISO format
   - Array: No
   - Description: The date when the stock product was last updated

4. **$createdAt** (System-generated)

   - This is automatically created by Appwrite
   - Contains the creation date of the document

5. **$id** (System-generated)
   - This is automatically created by Appwrite
   - Contains the unique ID of the document

## Step-by-Step Setup in Appwrite Console

1. **Log in to your Appwrite Console**

   - Go to https://cloud.appwrite.io/ and log in

2. **Navigate to your project**

   - Select your Cepoka project

3. **Go to Databases**

   - Click on "Databases" in the left sidebar

4. **Select your database**

   - Database ID: 6813eadb003e7d64f63c (confirmed correct database ID)

5. **Select the Stock Products Collection**

   - Collection ID: 681a651d001cc3de8395
   - If it doesn't exist, create it with this ID

6. **Add the Required Attributes**

   a. **Add the 'name' attribute**

   - Click "Create Attribute"
   - Select "String"
   - Name: name
   - Size: 255 (or your preferred maximum length)
   - Required: Yes
   - Default: None
   - Array: No
   - Click "Create"

   b. **Add the 'stockMovements' attribute**

   - Click "Create Attribute"
   - Select "JSON"
   - Name: stockMovements
   - Required: Yes
   - Default: `[]` (empty array)
   - Click "Create"

   c. **Add the 'lastUpdated' attribute**

   - Click "Create Attribute"
   - Select "String"
   - Name: lastUpdated
   - Size: 255
   - Required: Yes
   - Default: None (the application will set this)
   - Array: No
   - Click "Create"

7. **Set Appropriate Permissions**
   - Click on the "Settings" tab of your collection
   - Under "Permissions", set the appropriate read/write permissions
   - For a basic setup, you might want to allow:
     - Read: `["role:all"]` (anyone can read)
     - Write: `["role:member"]` (only authenticated users can write)

## Stock Movement Object Structure

Each stock movement in the `stockMovements` array should have the following structure:

```json
{
  "date": "2023-05-01T12:00:00.000Z",
  "stockedIn": 10,
  "stockedOut": 0,
  "remarks": "Initial stock",
  "totalStock": 10,
  "balance": 10,
  "sign": "John Doe"
}
```

- **date**: ISO date string when the movement occurred
- **stockedIn**: Number of items stocked in (added to inventory)
- **stockedOut**: Number of items stocked out (removed from inventory)
- **remarks**: Notes about this stock movement
- **totalStock**: Total stock after this movement (previous balance + stockedIn)
- **balance**: Current balance after this movement (totalStock - stockedOut)
- **sign**: Signature or name of the person who made this movement

## Example Document

Here's an example of a complete stock product document:

```json
{
  "$id": "unique_document_id",
  "$createdAt": "2023-05-01T12:00:00.000Z",
  "name": "Salon Chair",
  "stockMovements": [
    {
      "date": "2023-05-01T12:00:00.000Z",
      "stockedIn": 10,
      "stockedOut": 0,
      "remarks": "Initial stock",
      "totalStock": 10,
      "balance": 10,
      "sign": "John Doe"
    },
    {
      "date": "2023-05-10T14:30:00.000Z",
      "stockedIn": 5,
      "stockedOut": 0,
      "remarks": "Restocked",
      "totalStock": 15,
      "balance": 15,
      "sign": "Jane Smith"
    }
  ],
  "lastUpdated": "2023-05-10T14:30:00.000Z"
}
```

## Testing Your Setup

After setting up the attributes, you can test your setup by:

1. Creating a new stock product document manually in the Appwrite console
2. Using the stock manager application to create a new stock product
3. Verifying that the document is created with the correct structure

## Troubleshooting

If you encounter issues:

1. **Check attribute types**: Make sure all attributes have the correct types
2. **Check permissions**: Ensure your application has the right permissions to read/write to the collection
3. **Check JSON structure**: For the stockMovements attribute, ensure it's a valid JSON array
4. **Check for required fields**: Make sure all required fields are provided when creating documents

## Next Steps

Once your attributes are set up correctly, you can:

1. Start using the stock management system
2. Create stock products
3. Add stock movements
4. Generate PDF reports
5. Track your inventory efficiently
