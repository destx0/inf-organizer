"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EditFormData } from "@/lib/types";
import { QuizMetadata } from "@/lib/types";

interface BatchEditDialogProps {
  onBatchEdit: (data: Partial<QuizMetadata>) => Promise<void>;
}

export function BatchEditDialog({ onBatchEdit }: BatchEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData>({
    duration: "",
    positiveScore: "",
    negativeScore: "",
    title: "",
    description: "",
  });

  const handleSave = async () => {
    try {
      const updatedData: Partial<QuizMetadata> = {};
      
      if (editForm.duration) {
        updatedData.duration = parseInt(editForm.duration);
      }
      if (editForm.positiveScore) {
        updatedData.positiveScore = parseInt(editForm.positiveScore);
      }
      if (editForm.negativeScore) {
        updatedData.negativeScore = parseInt(editForm.negativeScore);
      }

      await onBatchEdit(updatedData);
      setIsOpen(false);
      setEditForm({
        duration: "",
        positiveScore: "",
        negativeScore: "",
        title: "",
        description: "",
      });
    } catch (error) {
      console.error("Failed to update all quizzes:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mb-4">
          Batch Edit Quizzes
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit All Quizzes</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              value={editForm.duration}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  duration: e.target.value,
                })
              }
              placeholder="Leave empty to keep existing values"
            />
          </div>
          <div className="space-y-2">
            <Label>Positive Score</Label>
            <Input
              type="number"
              value={editForm.positiveScore}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  positiveScore: e.target.value,
                })
              }
              placeholder="Leave empty to keep existing values"
            />
          </div>
          <div className="space-y-2">
            <Label>Negative Score</Label>
            <Input
              type="number"
              value={editForm.negativeScore}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  negativeScore: e.target.value,
                })
              }
              placeholder="Leave empty to keep existing values"
            />
          </div>
          <Button onClick={handleSave} className="w-full">
            Update All Quizzes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 