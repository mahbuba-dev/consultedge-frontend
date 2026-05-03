"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface ReviewModalProps {
  open: boolean;
  consultationId: string;
  onSubmit: (rating: number, comment: string, consultationId: string) => void;
  onClose: () => void;
  loading?: boolean;
}

export default function ReviewModal({ open, onSubmit, onClose, loading, consultationId }: ReviewModalProps) {
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState("");

	const handleClose = () => {
		setRating(0);
		setComment("");
		onClose();
	};

	return (
		<Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? handleClose() : undefined)}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Star className="size-5 text-yellow-400" />
						Leave a Review
					</DialogTitle>
					<DialogDescription>
						Please rate your session and share feedback with your expert.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-4 pt-2">
					<div className="flex items-center gap-1">
						{[1, 2, 3, 4, 5].map((i) => (
							<button
								key={i}
								type="button"
								onClick={() => setRating(i)}
								className="group"
								aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
							>
								<Star
									className={`size-7 transition ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-400"}`}
									strokeWidth={i <= rating ? 0 : 1.5}
								/>
							</button>
						))}
					</div>
					<Textarea
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						placeholder="Share your feedback (optional)"
						rows={4}
						className="resize-none"
					/>
					<Button
  onClick={() => onSubmit(rating, comment, consultationId)}
  disabled={rating === 0 || loading}
>
  Submit Review
</Button>
					<Button variant="ghost" onClick={handleClose} className="w-full">
						Skip
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
