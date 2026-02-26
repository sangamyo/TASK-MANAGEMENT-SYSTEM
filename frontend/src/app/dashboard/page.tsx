"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth-guard";
import { TaskForm, TaskFormValues } from "@/components/task-form";
import { TaskFilters, TaskFilterState } from "@/components/task-filters";
import { TaskList } from "@/components/task-list";
import { Button } from "@/components/ui/button";
import { createTask, deleteTask, fetchTasks, toggleTask, updateTask } from "@/lib/tasks";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState<TaskFilterState>({ search: "", status: "all" });
  const [page, setPage] = useState(1);
  const limit = 10;
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => ["tasks", { page, filters }], [page, filters]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: () =>
      fetchTasks({
        page,
        limit,
        search: filters.search || undefined,
        status: filters.status === "all" ? undefined : filters.status,
      }),
    staleTime: 10 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      toast.success("Task created");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to create task")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: TaskFormValues }) => updateTask(id, values),
    onSuccess: () => {
      toast.success("Task updated");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to update task")),
  });

  const toggleMutation = useMutation({
    mutationFn: toggleTask,
    onSuccess: () => {
      toast.success("Task toggled");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to update task")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      toast.success("Task deleted");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to delete task")),
  });

  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-600">Logged in as</p>
              <h1 className="text-2xl font-semibold text-gray-900">{user?.name || user?.email}</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh
              </Button>
              <Button variant="destructive" onClick={logout}>
                Logout
              </Button>
            </div>
          </header>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Create a task</h2>
                <p className="text-sm text-gray-600">Quickly add tasks with title and optional description.</p>
              </div>
              <div className="text-xs text-gray-500">Autosaves after submit</div>
            </div>
            <div className="mt-4">
              <TaskForm
                onSubmit={async (values) => {
                  await createMutation.mutateAsync(values);
                  setPage(1);
                }}
                isSubmitting={createMutation.isPending}
                submitLabel="Add task"
              />
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Your tasks</h2>
                <p className="text-sm text-gray-600">Search, filter, paginate, and manage tasks.</p>
              </div>
              {isFetching && <span className="text-sm text-gray-500">Updating...</span>}
            </div>
            <TaskFilters
              filters={filters}
              onChange={(next) => {
                setFilters(next);
                setPage(1);
              }}
              onReset={() => {
                setFilters({ search: "", status: "all" });
                setPage(1);
              }}
            />
            <TaskList
              tasks={data?.data || []}
              isLoading={isLoading}
              onToggle={(id) => toggleMutation.mutateAsync(id)}
              onDelete={(id) => deleteMutation.mutateAsync(id)}
              onUpdate={(id, values) => updateMutation.mutateAsync({ id, values })}
            />
            {totalPages > 1 && (
              <div className="flex items-center justify-end gap-3">
                <p className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </AuthGuard>
  );
}
