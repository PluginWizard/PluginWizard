export interface Project {
    id: string;
    name: string;
    description: string;
    groupId: string;
    author: string;
    version: string | null;
    workspaceJson: any;
    createdAt?: number;
    updatedAt?: number;
}