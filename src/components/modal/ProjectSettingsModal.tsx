import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Project } from "../../types/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface ProjectSettingsModalProps {
	isOpen: boolean;
	project: Project | null;
	onClose: () => void;
	onSave: (updates: Pick<Project, "name" | "description" | "author" | "groupId">) => void;
}

export default function ProjectSettingsModal({ isOpen, project, onClose, onSave }: ProjectSettingsModalProps) {
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [projectName, setProjectName] = useState("");
	const [projectDescription, setProjectDescription] = useState("");
	const [authorName, setAuthorName] = useState("");
	const [groupId, setGroupId] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (!isOpen || !project) return;
		setErrors({});
		setProjectName(project.name ?? "");
		setProjectDescription(project.description ?? "");
		setAuthorName(project.author ?? "");
		setGroupId(project.groupId ?? "");
	}, [isOpen, project]);

	const handleSave = () => {
		setErrors({});
		setIsSaving(true);

		const newErrors: Record<string, string> = {};

		if (projectName.trim().length === 0) newErrors.projectName = "Project name is required";
		if (projectDescription.trim().length === 0) newErrors.projectDescription = "Description is required";
		if (authorName.trim().length === 0) newErrors.authorName = "Author name is required";
		if (groupId.trim().length === 0) newErrors.groupId = "Group ID is required";

		if (projectName.length > 26) newErrors.projectName = "Project name must be under 26 characters";
		if (projectDescription.length > 120) newErrors.projectDescription = "Description must be under 120 characters";
		if (authorName.length > 26) newErrors.authorName = "Author name must be under 26 characters";
		if (groupId.split(".").length < 2) newErrors.groupId = "Group ID must be in the format 'com.yourname'";

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			setIsSaving(false);
			return;
		}

		onSave({
			name: projectName,
			description: projectDescription,
			author: authorName,
			groupId,
		});

		setIsSaving(false);
	};

	if (!isOpen || !project) return null;

	return (
		<div
			className="fixed inset-0 z-101 flex items-center justify-center bg-black/60 p-4"
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

				<h2 className="text-3xl font-semibold tracking-tight">Project Settings</h2>
				<p className="mt-2 mb-6 text-sm text-muted-foreground">
					Update your existing project configuration.
				</p>

				<div className="flex flex-col space-y-4">
					<div className="space-y-2 w-full">
						<Label htmlFor="settingsProjectName" className="text-sm font-medium">Project Name</Label>
						<Input
							id="settingsProjectName"
							placeholder="My Awesome Plugin"
							value={projectName}
							onChange={(e) => setProjectName(e.target.value)}
							required
							className={`h-11 rounded-xl border-border focus:border-muted-foreground/40 ${errors.projectName ? "border-red-500" : ""}`}
						/>
						{errors.projectName && <p className="text-sm text-red-500 mt-1">{errors.projectName}</p>}
					</div>

					<div className="space-y-2 w-full">
						<Label htmlFor="settingsProjectDescription" className="text-sm font-medium">Project Description</Label>
						<Input
							id="settingsProjectDescription"
							placeholder="A brief description of your project"
							value={projectDescription}
							onChange={(e) => setProjectDescription(e.target.value)}
							required
							className={`h-11 rounded-xl border-border focus:border-muted-foreground/40 ${errors.projectDescription ? "border-red-500" : ""}`}
						/>
						{errors.projectDescription && <p className="text-sm text-red-500 mt-1">{errors.projectDescription}</p>}
					</div>

					<div className="space-y-2 w-full">
						<Label htmlFor="settingsGroupId" className="text-sm font-medium">Group ID</Label>
						<Input
							id="settingsGroupId"
							placeholder="com.yourname"
							value={groupId}
							onChange={(e) => setGroupId(e.target.value)}
							required
							className={`h-11 rounded-xl border-border focus:border-muted-foreground/40 ${errors.groupId ? "border-red-500" : ""}`}
						/>
						<p className="text-xs text-muted-foreground">Use reverse domain notation (for example: com.example)</p>
						{errors.groupId && <p className="text-sm text-red-500 mt-1">{errors.groupId}</p>}
					</div>

					<div className="space-y-2 w-full">
						<Label htmlFor="settingsAuthorName" className="text-sm font-medium">Author Name</Label>
						<Input
							id="settingsAuthorName"
							placeholder="Your name or nickname"
							value={authorName}
							onChange={(e) => setAuthorName(e.target.value)}
							required
							className={`h-11 rounded-xl border-border focus:border-muted-foreground/40 ${errors.authorName ? "border-red-500" : ""}`}
						/>
						{errors.authorName && <p className="text-sm text-red-500 mt-1">{errors.authorName}</p>}
					</div>

					<div className="mt-2 flex gap-2">
						<Button
							type="button"
							variant="outline"
							className="h-11 flex-1 rounded-xl border-card-muted-foreground/30! bg-card-lighter! cursor-pointer"
							onClick={() => onClose?.()}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							className="h-11 flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl cursor-pointer"
							disabled={isSaving}
							onClick={handleSave}
						>
							{isSaving ? "Saving..." : "Save"}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
