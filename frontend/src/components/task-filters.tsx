"use client";

import { Select } from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export type TaskFilterState = {
  search: string;
  status: "all" | "true" | "false";
};

export const TaskFilters = ({
  filters,
  onChange,
  onReset,
}: {
  filters: TaskFilterState;
  onChange: (filters: TaskFilterState) => void;
  onReset: () => void;
}) => {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
        <Input
          placeholder="Search by title"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="md:max-w-xs"
        />
        <Select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value as TaskFilterState["status"] })}
          className="md:max-w-[180px]"
        >
          <option value="all">All statuses</option>
          <option value="false">Pending</option>
          <option value="true">Completed</option>
        </Select>
      </div>
      <Button variant="outline" onClick={onReset} className="md:w-auto">
        Reset
      </Button>
    </div>
  );
};
