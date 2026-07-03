import { Database, HardDrive, ShieldCheck, Zap } from "lucide-react";
import { Button } from "../ui/button";

interface StorageConsentModalProps {
    isOpen: boolean;
    isProcessing?: boolean;
    onAccept: () => void;
    onDecline: () => void;
}

export default function StorageConsentModal({ isOpen, isProcessing = false, onAccept, onDecline }: StorageConsentModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-101 flex items-center justify-center bg-black/60 p-4">
            <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card-darker p-6 sm:p-8 shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-600/15 text-green-500">
                        <Database className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight">Save your projects automatically</h2>
                </div>

                <p className="mt-4 text-sm text-muted-foreground">
                    PluginWizard can store your projects right here in your browser so your work is saved
                    automatically and is still here when you come back.
                </p>

                <p className="mt-3 text-sm text-muted-foreground">
                    Enabling <span className="font-medium text-foreground">persistent storage</span> lets us use
                    IndexedDB and asks your browser not to delete your projects when disk space runs low. If you
                    prefer not to, we'll fall back to basic browser storage, which works but may be cleared by your
                    browser and holds less data.
                </p>

                <ul className="mt-5 space-y-3">
                    <li className="flex items-start gap-3 text-sm">
                        <Zap className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                        <span>Your changes are saved as you build - reload the page and pick up where you left off.</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                        <span>Everything stays on this device. Nothing is uploaded to a server.</span>
                    </li>
                </ul>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Button
                        onClick={onAccept}
                        disabled={isProcessing}
                        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                    >
                        <Database className="h-4 w-4" />
                        {isProcessing ? "Enabling..." : "Enable persistent storage"}
                    </Button>
                    <Button
                        onClick={onDecline}
                        disabled={isProcessing}
                        variant="outline"
                        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border-card-muted-foreground/30! bg-card-lighter! hover:bg-foreground/15 cursor-pointer"
                    >
                        <HardDrive className="h-4 w-4" />
                        Use basic storage
                    </Button>
                </div>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                    You can clear stored projects at any time from your browser settings.
                </p>
            </div>
        </div>
    );
}
