import { TableClient, TableServiceClient } from "@azure/data-tables";

const connectionString = process.env.AZURE_TABLE_CONNECTION_STRING || "UseDevelopmentStorage=true";
const tableName = "FamilyTasks";

let tableClient: TableClient | null = null;

export async function getTableClient(): Promise<TableClient> {
    if (!tableClient) {
        const serviceClient = TableServiceClient.fromConnectionString(connectionString);

        // Create table if it doesn't exist
        try {
            await serviceClient.createTable(tableName);
        } catch (error: unknown) {
            // Table already exists - that's fine
            const statusCode = (error as { statusCode?: number })?.statusCode;
            if (statusCode !== 409) {
                throw error;
            }
        }

        tableClient = TableClient.fromConnectionString(connectionString, tableName);
    }
    return tableClient;
}

export interface TaskEntity {
    partitionKey: string; // Family code
    rowKey: string; // Task ID
    title: string;
    date: string;
    isCompleted: boolean;
    assignee: string;
    startTime?: string;
    durationMinutes?: number;
    category?: string;
}
