
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose, // Import DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { setUserPermissionsAction } from '@/actions/set-user-permissions'; // Import the action
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react'; // For loading indicator

interface UserPermissionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    userEmail: string | undefined;
    currentAllowedSections: string[];
    onPermissionsUpdate: () => void; // Callback to refresh user list
}

const ALL_SECTIONS = [
    { id: 'daily-report', label: 'Activité TSUD' },
    { id: 'activity-report', label: 'Activité TNR' },
    { id: 'r0-report', label: 'Rapport R0' },
    { id: 'truck-tracking', label: 'Pointage Camions' },
];

export function UserPermissionsDialog({
    open,
    onOpenChange,
    userId,
    userEmail,
    currentAllowedSections,
    onPermissionsUpdate,
}: UserPermissionsDialogProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    // Initialize selected sections based on currentAllowedSections prop
    const [selectedSections, setSelectedSections] = useState<string[]>([]);

    // Update state when currentAllowedSections prop changes (e.g., dialog reopens for same user after update)
    useEffect(() => {
        setSelectedSections(currentAllowedSections);
    }, [currentAllowedSections, open]); // Update when prop changes or dialog opens


    const handleCheckboxChange = (sectionId: string, checked: boolean | "indeterminate") => {
         setSelectedSections(prev =>
            checked === true
                ? [...prev, sectionId] // Add section
                : prev.filter(id => id !== sectionId) // Remove section
        );
    };

    const handleSaveChanges = async () => {
        startTransition(async () => {
            const result = await setUserPermissionsAction(userId, selectedSections);
            toast({
                title: result.success ? "Succès" : "Erreur",
                description: result.message,
                variant: result.success ? "default" : "destructive",
            });
            if (result.success) {
                onPermissionsUpdate(); // Refresh the user list in the parent
                onOpenChange(false); // Close the dialog
            }
        });
    };

    // Determine if any changes have been made
    const hasChanges = JSON.stringify(selectedSections.sort()) !== JSON.stringify(currentAllowedSections.sort());


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Gérer les Permissions pour {userEmail || userId}</DialogTitle>
                    <DialogDescription>
                        Sélectionnez les sections de rapport auxquelles cet utilisateur aura accès.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    {ALL_SECTIONS.map((section) => (
                        <div key={section.id} className="flex items-center space-x-3">
                            <Checkbox
                                id={`perm-${section.id}`}
                                checked={selectedSections.includes(section.id)}
                                onCheckedChange={(checked) => handleCheckboxChange(section.id, checked)}
                                disabled={isPending}
                            />
                            <Label
                                htmlFor={`perm-${section.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {section.label}
                            </Label>
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    {/* Use DialogClose for the Cancel button */}
                    <DialogClose asChild>
                         <Button variant="outline" disabled={isPending}>Annuler</Button>
                    </DialogClose>
                    <Button onClick={handleSaveChanges} disabled={isPending || !hasChanges}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Enregistrer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
