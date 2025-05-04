import { Client, Account, Databases, Storage } from "appwrite";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67d07dc9000bafdd5d81"); // Your Appwrite Project ID

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const appwriteConfig = {
  databaseId: "6813eadb003e7d64f63c",
  productsCollectionId: "6813eaf40036e52c29b1",
  storageId: "6813ea36001624c1202a",
};

// project id: 67d07d7b0010f39ec77d
// database id: 67d8833d000778157021
// collection id: 67d8835b002502c5d7ba
// storage id: 67d8841a001213adf116