"use client";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Clock } from "lucide-react";

interface JoinSessionModalProps {
	open: boolean;
	scheduledStart: string | Date;
	onJoin: () => void;
	onClose: () => void;
	loading?: boolean;
}

export default function JoinSessionModal({ open, scheduledStart, onJoin, onClose, loading }: JoinSessionModalProps) {
	const [now, setNow] = useState(0);
	const startTime = useMemo(() => new Date(scheduledStart).getTime(), [scheduledStart]);
	const canJoin = now >= startTime - 2 * 60 * 1000; // Allow join 2 min before start
	const countdown = Math.max(0, Math.floor((startTime - now) / 1000));

	useEffect(() => {
		if (!open) return;
		const interval = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(interval);
	}, [open]);

	// Format countdown as D:HH:MM:SS if large
	let countdownLabel = "";
	if (!canJoin) {
		const days = Math.floor(countdown / 86400);
		const hours = Math.floor((countdown % 86400) / 3600);
		const minutes = Math.floor((countdown % 3600) / 60);
		const seconds = countdown % 60;
		if (days > 0) {
			countdownLabel = `${days}d ${hours}h ${minutes}m ${seconds}s`;
		} else if (hours > 0) {
			countdownLabel = `${hours}h ${minutes}m ${seconds}s`;
		} else {
			countdownLabel = `${minutes}m ${seconds}s`;
		}
	}

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Clock className="size-5 text-blue-600" />
						Join Consultation Session
					</DialogTitle>
					<DialogDescription>
						{canJoin
							? "You can now join your scheduled session."
							: `Session will be joinable in ${countdownLabel}`}
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-4 pt-2">
					<Button
						onClick={onJoin}
						disabled={!canJoin || loading}
						className="w-full bg-blue-600 text-white hover:bg-blue-700"
						size="lg"
					>
						{loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
						{canJoin ? "Join Now" : "Join Disabled"}
					</Button>
					<Button variant="ghost" onClick={onClose} className="w-full">
						Cancel
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
