"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface EndSessionModalProps {
	open: boolean;
	onConfirm: () => void;
	onCancel: () => void;
	loading?: boolean;
}

export default function EndSessionModal({ open, onConfirm, onCancel, loading }: EndSessionModalProps) {
	return (
		<Dialog open={open} onOpenChange={onCancel}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-red-600">
						<AlertTriangle className="size-5" />
						End Consultation Session?
					</DialogTitle>
					<DialogDescription>
						Are you sure you want to end this session? This action cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-4 pt-2">
					<Button
						onClick={onConfirm}
						disabled={loading}
						variant="destructive"
						className="w-full"
						size="lg"
					>
						End Session
					</Button>
					<Button variant="ghost" onClick={onCancel} className="w-full">
						Cancel
					</Button>
					
            
				</div>
			</DialogContent>
		</Dialog>
	);
}
