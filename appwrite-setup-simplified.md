# Simplified Appwrite Setup for Stock Management

This guide explains exactly how to set up your Appwrite collection for the stock management system.

## Important: How Stock Data is Stored

The stock management system uses a **single collection** with **three main attributes**:

1. **name** (String): The product name
2. **stockMovements** (JSON): An array containing all stock movements
3. **lastUpdated** (String): When the product was last updated

The key point to understand is that **stockMovements is a JSON array** - you don't need to create separate attributes for each property of a movement. The entire array is stored as a single JSON field.

## Step-by-Step Setup

1. **Log in to Appwrite Console**

   - Go to https://cloud.appwrite.io/

2. **Navigate to Your Project**

   - Select your Cepoka project (ID: 67d07dc9000bafdd5d81)

3. **Go to Databases**

   - Click on "Databases" in the left sidebar

4. **Select Your Database**

   - Database ID: 6813eadb003e7d64f63c

5. **Create the Stock Products Collection**

   - Click "Create Collection"
   - Set Collection ID: 681a651d001cc3de8395
   - Set Name: "Stock Products"
   - Set appropriate permissions (e.g., allow read/write for all users)
   - Click "Create"

6. **Add the Required Attributes**

   a. **Add the 'name' attribute**

   - Click "Create Attribute"
   - Select "String"
   - Name: name
   - Size: 255
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
   - Default: None
   - Array: No
   - Click "Create"

7. **Set Appropriate Permissions**
   - Click on the "Settings" tab of your collection
   - Under "Permissions", set the appropriate read/write permissions
   - For a basic setup, you might want to allow:
     - Read: `["role:all"]` (anyone can read)
     - Write: `["role:member"]` (only authenticated users can write)

## Understanding the stockMovements Array

The `stockMovements` attribute is a JSON array where each object has this structure:

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

You don't need to create separate attributes for each of these properties. The entire array is stored as a single JSON field in Appwrite.

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

## Important Notes

1. **You only need 3 attributes** in the collection: name, stockMovements, and lastUpdated.

2. **stockMovements is a JSON array** - you don't need to create separate attributes for date, stockedIn, stockedOut, etc.

3. **The application handles the JSON structure** - you just need to create the JSON attribute in Appwrite.

4. **The application calculates totals and balances** - you don't need to worry about these calculations.

5. **The application generates the correct JSON format** - you just need to make sure the attribute exists.

## Troubleshooting

If you're having issues:

1. **Check that the collection ID is correct**: 681a651d001cc3de8395
2. **Verify that you have exactly 3 attributes**: name, stockMovements, lastUpdated
3. **Make sure stockMovements is a JSON attribute**: Not a string or any other type
4. **Check permissions**: Make sure your application has write permissions to the collection
