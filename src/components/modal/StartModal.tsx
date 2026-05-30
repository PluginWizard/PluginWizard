import { useRef, useState } from "react";
import { FolderOpen, Plus } from "lucide-react";
import { Project } from "../../types/types";

interface StartModalProps {
    onOpenProject: (project: Project) => void;
    onNewProject: () => void;
    isOpen: boolean;
}

export default function StartModal({ onOpenProject, onNewProject, isOpen }: StartModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileError, setFileError] = useState<string | null>(null);

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
                onOpenProject(project);
            } catch {
                setFileError("Failed to parse project file. Make sure it is a valid .mcwizard file.");
            }
        };
        reader.readAsText(file);
        event.target.value = "";
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-100">
            <div className="bg-card-darker rounded-lg p-12 w-full max-w-md border border-foreground/10">
                <h2 className="text-2xl font-bold mb-6 text-center">Welcome to PluginWizard</h2>
                <p className="mb-4 text-center">Get started by creating a new project or opening an existing one.</p>
                <div className="flex flex-row space-x-4">
                    <button
                        onClick={onNewProject}
                        className="flex items-center justify-center gap-2 w-full rounded-lg bg-green-600 text-white py-2 px-4 transition-all duration-300 hover:bg-green-700 cursor-pointer"
                    >
                        <Plus className="h-4 w-4 shrink-0" />
                        New Project
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 w-full rounded-lg bg-card-lighter py-2 px-4 transition-all duration-300 hover:border-muted-foreground/80! hover:bg-foreground/15 border border-foreground/10 cursor-pointer"
                    >
                        <FolderOpen className="h-4 w-4 shrink-0" />
                        Open Project
                    </button>
                </div>
                {fileError && (
                    <p className="mt-4 text-sm text-red-500 text-center">{fileError}</p>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mcwizard"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    )
}