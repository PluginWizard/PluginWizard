import { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { Project } from "../../types/types";
import { v4 as uuidv4 } from "uuid";
import { defaultWorkspcaeJson } from "../../lib/config";

interface NewProjectModalProps {
    onNewProject: (project: Project) => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function NewProjectModal({ onNewProject, isOpen, onClose }: NewProjectModalProps) {
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [groupId, setGroupId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [project, setProject] = useState<Project | null>(null);

    const handleSubmit = () => {
        setErrors({})
        setIsLoading(true)
        const newErrors: Record<string, string> = {};

        if (projectName.trim().length === 0) newErrors.projectName = "Project name is required"
        if (projectDescription.trim().length === 0) newErrors.projectDescription = "Description is required"
        if (authorName.trim().length === 0) newErrors.authorName = "Author name is required"
        if (groupId.trim().length === 0) newErrors.groupId = "Group ID is required"

        if (projectName.length > 26) newErrors.projectName = "Project name must be under 26 characters"
        if (projectDescription.length > 120) newErrors.projectDescription = "Description must be under 120 characters"
        if (authorName.length > 26) newErrors.authorName = "Author name must be under 26 characters"
        if (groupId.split(".").length < 2) newErrors.groupId = "Group ID must be in the format 'com.yourname'"

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            setIsLoading(false)
            return
        }

        const newProject: Project = {
            id: uuidv4(),
            name: projectName,
            description: projectDescription,
            author: authorName,
            groupId: groupId,
            version: "1.0.0",
            workspaceJson: defaultWorkspcaeJson
        }

        setIsLoading(false)
        onNewProject(newProject);
    }

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose?.();
                }
            }}
        >
            <div className="relative w-full max-w-2xl rounded-2xl border border-border/80 bg-card-darker p-6 sm:p-8 shadow-2xl">
                <button
                    type="button"
                    aria-label="Close modal"
                    onClick={() => onClose?.()}
                    className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-card-lighter hover:text-foreground cursor-pointer"
                >
                    <X className="h-4 w-4" />
                </button>

                <h2 className="text-3xl font-semibold tracking-tight">Create New Project</h2>
                <p className="mt-2 mb-6 text-sm text-muted-foreground">
                    Set up your new plugin project with the configuration below.
                </p>

                <div className="flex flex-col space-y-4">
                    {/* Project Name */}
                    <div className="space-y-2 w-full">
                        <Label htmlFor="projectName" className="text-sm font-medium">Project Name</Label>
                        <Input
                        id="projectName"
                        placeholder="My Awesome Plugin"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        required
                        className={`h-11 rounded-xl border-border focus:border-muted-foreground/40 ${errors.projectName ? "border-red-500" : ""}`}
                        />
                        {errors.projectName && <p className="text-sm text-red-500 mt-1">{errors.projectName}</p>}
                    </div>

                    {/* Project Description */}
                    <div className="space-y-2 w-full">
                        <Label htmlFor="projectDescription" className="text-sm font-medium">Project Description</Label>
                        <Input
                        id="projectDescription"
                        placeholder="A brief description of your project"
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        required
                        className={`h-11 rounded-xl border-border focus:border-muted-foreground/40 ${errors.projectDescription ? "border-red-500" : ""}`}
                        />
                        {errors.projectDescription && <p className="text-sm text-red-500 mt-1">{errors.projectDescription}</p>}
                    </div>

                    {/* Group ID */}
                    <div className="space-y-2 w-full">
                        <Label htmlFor="groupId" className="text-sm font-medium">Group ID</Label>
                        <Input
                        id="groupId"
                        placeholder="com.yourname"
                        value={groupId}
                        onChange={(e) => setGroupId(e.target.value)}
                        required
                        className={`h-11 rounded-xl border-border focus:border-muted-foreground/40 ${errors.groupId ? "border-red-500" : ""}`}
                        />
                        <p className="text-xs text-muted-foreground">Use reverse domain notation (for example: com.example)</p>
                        {errors.groupId && <p className="text-sm text-red-500 mt-1">{errors.groupId}</p>}
                    </div>

                    {/* Author Name */}
                    <div className="space-y-2 w-full">
                        <Label htmlFor="authorName" className="text-sm font-medium">Author Name</Label>
                        <Input
                        id="authorName"
                        placeholder="Your name or nickname"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        required
                        className={`h-11 rounded-xl border-border focus:border-muted-foreground/40 ${errors.authorName ? "border-red-500" : ""}`}
                        />
                        {errors.authorName && <p className="text-sm text-red-500 mt-1">{errors.authorName}</p>}
                    </div>
                    {errors.root && <p className="text-sm text-red-500 text-center">{errors.root}</p>}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="mt-2 h-11 w-full bg-green-600 hover:bg-green-700 text-white rounded-xl cursor-pointer"
                        disabled={isLoading}
                        onClick={handleSubmit}
                    >
                        {isLoading ? "Creating Project..." : "Create Project"}
                    </Button>
                </div>
            </div>
        </div>
    )
}