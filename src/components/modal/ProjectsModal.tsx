import { useMemo, useRef, useState } from "react";
import { Clock, FolderOpen, Package, Plus, Trash2, Upload, User } from "lucide-react";
import { Project } from "../../types/types";
import { StoragePreference } from "../../lib/storage/projectStore";
import { Button } from "../ui/button";

interface ProjectsModalProps {
    isOpen: boolean;
    projects: Project[];
    storageMode: StoragePreference;
    onOpenProject: (project: Project) => void;
    onDeleteProject: (id: string) => void;
    onNewProject: () => void;
    onImportProject: (project: Project) => void;
}

function formatRelativeTime(timestamp?: number): string {
    if (!timestamp) return "Unknown";
    const diffMs = Date.now() - timestamp;
    const seconds = Math.floor(diffMs / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years === 1 ? "" : "s"} ago`;
}

export default function ProjectsModal({
    isOpen,
    projects,
    onOpenProject,
    onDeleteProject,
    onNewProject,
    onImportProject,
}: ProjectsModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [pendingDelete, setPendingDelete] = useState<Project | null>(null);

    const sortedProjects = useMemo(
        () =>
            [...projects].sort(
                (a, b) => (b.updatedAt ?? b.createdAt ?? 0) - (a.updatedAt ?? a.createdAt ?? 0)
            ),
        [projects]
    );

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFileError(null);
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith(".mcwizard")) {
            setFileError("Invalid file type. Please select a .mcwizard file.");
            event.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const project = JSON.parse(e.target?.result as string) as Project;
                onImportProject(project);
            } catch {
                setFileError("Failed to parse project file. Make sure it is a valid .mcwizard file.");
            }
        };
        reader.readAsText(file);
        event.target.value = "";
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4">
            <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-border/80 bg-card-darker p-6 shadow-2xl sm:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-3xl font-semibold tracking-tight">Your Projects</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Open a saved project, or start a new one.
                        </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            className="rounded-xl border-card-muted-foreground/30! bg-card-lighter! hover:bg-foreground/15 cursor-pointer"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Import
                        </Button>
                        <Button
                            onClick={onNewProject}
                            className="rounded-xl bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Project
                        </Button>
                    </div>
                </div>

                {/* Body */}
                <div className="mt-6 flex-1 overflow-y-auto pr-1">
                    {sortedProjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card-lighter/40 px-6 py-14 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card-lighter text-muted-foreground">
                                <FolderOpen className="h-7 w-7" />
                            </div>
                            <h3 className="mt-4 text-lg font-medium">No saved projects yet</h3>
                            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                Create your first plugin project or import an existing{" "}
                                <span className="font-mono">.mcwizard</span> file to get started.
                            </p>
                            <Button
                                onClick={onNewProject}
                                className="mt-5 rounded-xl bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create new project
                            </Button>
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {sortedProjects.map((project) => (
                                <li
                                    key={project.id}
                                    className="group flex items-center justify-between gap-4 rounded-xl border border-border/80 bg-card-lighter/50 p-4 transition-colors hover:border-muted-foreground/40"
                                >
                                    <div className="min-w-0">
                                        <h3 className="truncate text-base font-medium">{project.name}</h3>
                                        {project.description && (
                                            <p className="mt-0.5 truncate text-sm text-muted-foreground">
                                                {project.description}
                                            </p>
                                        )}
                                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <User className="h-3.5 w-3.5" />
                                                {project.author}
                                            </span>
                                            {project.version && (
                                                <span className="flex items-center gap-1">
                                                    <Package className="h-3.5 w-3.5" />v{project.version}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                Edited {formatRelativeTime(project.updatedAt ?? project.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <Button
                                            onClick={() => onOpenProject(project)}
                                            className="rounded-xl bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                                        >
                                            <FolderOpen className="h-4 w-4 mr-2" />
                                            Open
                                        </Button>
                                        <button
                                            type="button"
                                            aria-label={`Delete ${project.name}`}
                                            onClick={() => setPendingDelete(project)}
                                            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-500/15 hover:text-red-500 cursor-pointer"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {fileError && <p className="mt-4 text-sm text-red-500 text-center">{fileError}</p>}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mcwizard"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {/* Delete confirmation */}
            {pendingDelete && (
                <div
                    className="fixed inset-0 z-110 flex items-center justify-center bg-black/70 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setPendingDelete(null);
                    }}
                >
                    <div className="w-full max-w-sm rounded-2xl border border-border/80 bg-card-darker p-6 shadow-2xl">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-500">
                                <Trash2 className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-semibold">Delete project</h3>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">
                            Are you sure you want to delete{" "}
                            <span className="font-medium text-foreground">{pendingDelete.name}</span>? This action
                            cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                onClick={() => setPendingDelete(null)}
                                variant="outline"
                                className="rounded-xl border-card-muted-foreground/30! bg-card-lighter! hover:bg-foreground/15 cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    onDeleteProject(pendingDelete.id);
                                    setPendingDelete(null);
                                }}
                                className="rounded-xl bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
