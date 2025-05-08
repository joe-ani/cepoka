# Appwrite Setup for Stock Management System

This document provides instructions for setting up the Appwrite collections and attributes required for the stock management system.

## Collection IDs

- Stock Products Collection ID: `681a651d001cc3de8395`
- Stock Movements Collection ID: `681bddcc000204a3748d`

## Stock Products Collection Attributes

1. **name** (String, required)

   - Type: String
   - Required: Yes
   - Default: None
   - Array: No
   - Description: The name of the stock product

2. **stockMovements** (Array of Strings, required)

   - Type: Array
   - Items Type: String
   - Required: Yes
   - Default: `[]` (empty array)
   - Description: An array of stringified JSON objects representing stock movements
   - Note: Each string in the array must be less than 225 characters

3. **lastUpdated** (String, required)
   - Type: String
   - Required: Yes
   - Default: Current date in ISO format
   - Array: No
   - Description: The date when the stock product was last updated

## Stock Movement Object Structure

Each stock movement object in the `stockMovements` array should have the following structure:

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

## Setting Up Collections in Appwrite Console

1. Log in to your Appwrite Console
2. Navigate to Databases
3. Select your database (`6813eadb003e7d64f63c`)
4. Create or update the Stock Products Collection:

   - Collection ID: `681a651d001cc3de8395`
   - Name: Stock Products
   - Permissions: Set as needed

5. Add the following attributes to the Stock Products Collection:

   - String attribute: `name`
   - Array attribute: `stockMovements` (with string items)
   - String attribute: `lastUpdated`

6. Create or update the Stock Movements Collection (if needed):
   - Collection ID: `681bddcc000204a3748d`
   - Name: Stock Movements
   - Permissions: Set as needed

## Example Document

Here's an example of a stock product document:

```json
{
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
    },
    {
      "date": "2023-05-15T09:45:00.000Z",
      "stockedIn": 0,
      "stockedOut": 3,
      "remarks": "Sold to customer",
      "totalStock": 15,
      "balance": 12,
      "sign": "John Doe"
    }
  ],
  "lastUpdated": "2023-05-15T09:45:00.000Z"
}
```

## Notes

- The `stockMovements` attribute is stored as an array of strings in the Stock Products Collection
- Each string in the array is a JSON-stringified object representing a stock movement
- Each string must be less than 225 characters in length
- For products with many movements, consider implementing pagination or archiving old movements to improve performance
- The Stock Movements Collection is optional and can be used if you want to store stock movements separately
- Make sure to set appropriate permissions for your collections based on your security requirements
