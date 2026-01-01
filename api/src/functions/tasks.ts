import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getTableClient, TaskEntity } from "../lib/tableClient.js";

interface TaskInput {
    id?: string;
    title: string;
    date: string;
    isCompleted?: boolean;
    assignee: string;
    startTime?: string;
    durationMinutes?: number;
    category?: string;
}

// GET /api/tasks?familyCode=xxx
app.http("getTasks", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "tasks",
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        const familyCode = request.query.get("familyCode");

        if (!familyCode) {
            return {
                status: 400,
                jsonBody: { error: "familyCode is required" }
            };
        }

        try {
            const tableClient = await getTableClient();
            const tasks: TaskEntity[] = [];

            const entities = tableClient.listEntities<TaskEntity>({
                queryOptions: { filter: `PartitionKey eq '${familyCode}'` }
            });

            for await (const entity of entities) {
                tasks.push({
                    partitionKey: entity.partitionKey!,
                    rowKey: entity.rowKey!,
                    title: entity.title,
                    date: entity.date,
                    isCompleted: entity.isCompleted,
                    assignee: entity.assignee,
                    startTime: entity.startTime,
                    durationMinutes: entity.durationMinutes,
                    category: entity.category
                });
            }

            // Transform to frontend format
            const frontendTasks = tasks.map(t => ({
                id: t.rowKey,
                title: t.title,
                date: t.date,
                isCompleted: t.isCompleted,
                assignee: t.assignee,
                startTime: t.startTime,
                durationMinutes: t.durationMinutes,
                category: t.category
            }));

            return {
                status: 200,
                jsonBody: frontendTasks
            };
        } catch (error: unknown) {
            context.error("Error fetching tasks:", error);
            return {
                status: 500,
                jsonBody: { error: "Failed to fetch tasks" }
            };
        }
    }
});

// POST /api/tasks
app.http("createTask", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "tasks",
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        try {
            const body = await request.json() as { familyCode?: string; task?: TaskInput };
            const { familyCode, task } = body;

            if (!familyCode || !task || !task.title || !task.date || !task.assignee) {
                return {
                    status: 400,
                    jsonBody: { error: "familyCode and task with title, date, assignee are required" }
                };
            }

            const tableClient = await getTableClient();

            const entity: TaskEntity = {
                partitionKey: familyCode,
                rowKey: task.id || crypto.randomUUID(),
                title: task.title,
                date: task.date,
                isCompleted: task.isCompleted ?? false,
                assignee: task.assignee,
                startTime: task.startTime,
                durationMinutes: task.durationMinutes,
                category: task.category
            };

            await tableClient.createEntity(entity);

            return {
                status: 201,
                jsonBody: {
                    id: entity.rowKey,
                    title: entity.title,
                    date: entity.date,
                    isCompleted: entity.isCompleted,
                    assignee: entity.assignee,
                    startTime: entity.startTime,
                    durationMinutes: entity.durationMinutes,
                    category: entity.category
                }
            };
        } catch (error: unknown) {
            context.error("Error creating task:", error);
            return {
                status: 500,
                jsonBody: { error: "Failed to create task" }
            };
        }
    }
});

// PUT /api/tasks/{id}
app.http("updateTask", {
    methods: ["PUT"],
    authLevel: "anonymous",
    route: "tasks/{id}",
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        try {
            const id = request.params.id;
            const body = await request.json() as { familyCode?: string; task?: TaskInput };
            const { familyCode, task } = body;

            if (!familyCode || !task || !id || !task.title || !task.date || !task.assignee) {
                return {
                    status: 400,
                    jsonBody: { error: "familyCode, task with required fields, and id are required" }
                };
            }

            const tableClient = await getTableClient();

            const entity: TaskEntity = {
                partitionKey: familyCode,
                rowKey: id,
                title: task.title,
                date: task.date,
                isCompleted: task.isCompleted ?? false,
                assignee: task.assignee,
                startTime: task.startTime,
                durationMinutes: task.durationMinutes,
                category: task.category
            };

            await tableClient.updateEntity(entity, "Replace");

            return {
                status: 200,
                jsonBody: {
                    id: entity.rowKey,
                    title: entity.title,
                    date: entity.date,
                    isCompleted: entity.isCompleted,
                    assignee: entity.assignee,
                    startTime: entity.startTime,
                    durationMinutes: entity.durationMinutes,
                    category: entity.category
                }
            };
        } catch (error: unknown) {
            context.error("Error updating task:", error);
            return {
                status: 500,
                jsonBody: { error: "Failed to update task" }
            };
        }
    }
});

// DELETE /api/tasks/{id}
app.http("deleteTask", {
    methods: ["DELETE"],
    authLevel: "anonymous",
    route: "tasks/{id}",
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        try {
            const id = request.params.id;
            const familyCode = request.query.get("familyCode");

            if (!familyCode || !id) {
                return {
                    status: 400,
                    jsonBody: { error: "familyCode and id are required" }
                };
            }

            const tableClient = await getTableClient();
            await tableClient.deleteEntity(familyCode, id);

            return {
                status: 204
            };
        } catch (error: unknown) {
            context.error("Error deleting task:", error);
            return {
                status: 500,
                jsonBody: { error: "Failed to delete task" }
            };
        }
    }
});
