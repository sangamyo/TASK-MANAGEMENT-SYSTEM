"use client";

import { Task } from "@/types";
import { Button } from "./ui/button";
import { useState } from "react";
import { TaskForm, TaskFormValues } from "./task-form";
import { Spinner } from "./ui/spinner";
import { cn } from "@/lib/utils";

export const TaskList = ({
  tasks,
  isLoading,
  onToggle,
  onDelete,
  onUpdate,
}: {
  tasks: Task[];
  isLoading: boolean;
  onToggle: (id: string) => Promise<unknown> | void;
  onDelete: (id: string) => Promise<unknown> | void;
  onUpdate: (id: string, values: TaskFormValues) => Promise<unknown> | void;
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-sm">
        <Spinner />
        <p className="text-sm text-gray-700">Loading tasks...</p>
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
        No tasks yet. Add your first task to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex h-6 items-center rounded-full px-3 text-xs font-semibold",
                    task.status ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700",
                  )}
                >
                  {task.status ? "Completed" : "Pending"}
                </span>
                <p className="text-xs text-gray-500">
                  {new Date(task.createdAt).toLocaleString()}
                </p>
              </div>
              <h3 className="mt-1 text-lg font-semibold text-gray-900">{task.title}</h3>
              {task.description && <p className="mt-1 text-sm text-gray-600">{task.description}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onToggle(task.id)}>
                {task.status ? "Mark Pending" : "Mark Done"}
              </Button>
              <Button variant="outline" onClick={() => setEditingId(task.id)}>
                Edit
              </Button>
              <Button variant="destructive" onClick={() => onDelete(task.id)}>
                Delete
              </Button>
            </div>
          </div>

          {editingId === task.id && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold text-gray-800">Edit Task</p>
                <Button variant="ghost" onClick={() => setEditingId(null)}>
                  Close
                </Button>
              </div>
              <TaskForm
                defaultValues={{ title: task.title, description: task.description || undefined }}
                submitLabel="Update"
                onSubmit={async (values) => {
                  await onUpdate(task.id, values);
                  setEditingId(null);
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
