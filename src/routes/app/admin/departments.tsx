import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useRivet } from "../../../lib/rivet/store";
import { Plus, Edit2, ShieldAlert, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../../components/ui/dialog";
import type { Department } from "../../../lib/rivet/types";

export const Route = createFileRoute("/app/admin/departments")({
  component: DepartmentsAdminPage,
});

function DepartmentsAdminPage() {
  const { departments, createDepartment, updateDepartment, deleteDepartment, users } = useRivet();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState("");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId("");
    setFormData({ name: "", active: true });
    setErrors({});
    setIsOpen(true);
  };

  const handleOpenEdit = (d: Department) => {
    setIsEditing(true);
    setEditingId(d.id);
    setFormData({
      name: d.name,
      active: d.active !== false, // default true if undefined
    });
    setErrors({});
    setIsOpen(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Required";
    else if (departments.some(d => d.name.toLowerCase() === formData.name.trim().toLowerCase() && d.id !== editingId)) {
      newErrors.name = "A department with this name already exists";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing) {
      updateDepartment(editingId, { ...formData });
    } else {
      createDepartment({
        name: formData.name.trim(),
        active: formData.active,
        code: formData.name.trim().substring(0, 3).toUpperCase(),
        managerIds: [],
        moduleKeys: [],
      });
    }
    setIsOpen(false);
  };

  const handleOpenDelete = (d: Department) => {
    setDepartmentToDelete(d);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (departmentToDelete) {
      deleteDepartment(departmentToDelete.id);
    }
    setIsDeleteDialogOpen(false);
    setDepartmentToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Departments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage organizational departments and functional groups.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" /> Add Department
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-border bg-surface text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Department Name</th>
              <th className="px-4 py-3">Members</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {departments.filter(d => !d.deleted).map(d => {
              const memberCount = users.filter(u => u.departmentIds.includes(d.id)).length;
              const isActive = d.active !== false;

              return (
                <tr key={d.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {d.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {memberCount} user{memberCount !== 1 ? 's' : ''}
                  </td>
                  <td className="px-4 py-3">
                    {isActive ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                        Deactivated
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleOpenEdit(d)}
                      className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
                      title="Edit department"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(d)}
                      className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete department"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Department" : "Add Department"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Department Name</label>
              <input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Sales, Marketing"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="active-dept"
                checked={formData.active}
                onChange={e => setFormData({ ...formData, active: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="active-dept" className="text-sm font-medium text-foreground">
                Department is active
              </label>
            </div>
            
            {!formData.active && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 flex gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Deactivated departments will no longer appear as options for users or module assignment.
                </p>
              </div>
            )}

            <DialogFooter className="pt-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
              >
                {isEditing ? "Save Changes" : "Create Department"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the <strong>{departmentToDelete?.name}</strong> department?
              <br /><br />
              If this department has existing users, modules, or records, it will be safely archived instead of permanently deleted to preserve historical data. It will no longer appear as an option for new assignments.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <button
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-surface transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              Delete Department
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
