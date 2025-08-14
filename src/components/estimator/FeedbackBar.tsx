import React from "react";
import { Button } from "@/components/ui/button";

export type FeedbackRating = 'accurate' | 'too_high' | 'too_low' | 'wrong_composition';

type Props = {
  onSubmit: (rating: FeedbackRating, reason?: string) => Promise<void> | void;
};

export function FeedbackBar({ onSubmit }: Props) {
  const handle = async (rating: FeedbackRating) => {
    let reason: string | undefined;
    if (rating !== 'accurate') {
      reason = window.prompt('Add an optional comment (press Cancel to skip)') ?? undefined;
    }
    await onSubmit(rating, reason);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => handle('accurate')}>Accurate</Button>
      <Button variant="outline" onClick={() => handle('too_high')}>Too high</Button>
      <Button variant="outline" onClick={() => handle('too_low')}>Too low</Button>
      <Button variant="outline" onClick={() => handle('wrong_composition')}>Wrong composition</Button>
    </div>
  );
}

export default FeedbackBar;
