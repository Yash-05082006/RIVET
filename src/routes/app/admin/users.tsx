import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useRivet } from "../../../lib/rivet/store";
import { formatDateTime } from "../../../lib/formatDate";
import { Plus, Edit2, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "../../../components/ui/dialog";
import type { User, Role } from "../../../lib/rivet/types";

export const Route = createFileRoute("/app/admin/users")({
  component: UsersAdminPage,
});

function UsersAdminPage() {
  const { users, departments, createUser, updateUser } = useRivet();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "employee" as Role,
    designation: "",
    departmentIds: [] as string[],
    active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId("");
    setFormData({ name: "", email: "", role: "employee", designation: "", departmentIds: [], active: true });
    setErrors({});
    setIsOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setIsEditing(true);
    setEditingId(u.id);
    setFormData({
      name: u.name,
      email: u.email,
      role: u.role,
      designation: u.designation,
      departmentIds: u.departmentIds,
      active: u.active,
    });
    setErrors({});
    setIsOpen(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Required";
    if (!formData.email.trim()) newErrors.email = "Required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid format";
    else if (users.some(u => u.email === formData.email && u.id !== editingId)) newErrors.email = "Duplicate email";
    
    if (!formData.designation.trim()) newErrors.designation = "Required";
    if (formData.departmentIds.length === 0) newErrors.departmentIds = "Select at least one department";
    else if (formData.role === "employee" && formData.departmentIds.length > 1) {
      newErrors.departmentIds = "Employees can only have one department";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing) {
      updateUser(editingId, { ...formData });
    } else {
      createUser({
        ...formData,
        avatarColor: "#5F6368",
        lastLoginAt: new Date().toISOString(),
      });
    }
    setIsOpen(false);
  };

  const toggleDept = (deptId: string) => {
    setFormData(prev => {
      if (prev.departmentIds.includes(deptId)) {
        return { ...prev, departmentIds: prev.departmentIds.filter(id => id !== deptId) };
      }
      return { ...prev, departmentIds: [...prev.departmentIds, deptId] };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage user accounts, roles, and access across the organization.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-background shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-border bg-surface text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Departments</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-surface/50 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">
                  {u.name}
                  <div className="text-xs font-normal text-muted-foreground">{u.designation}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{u.role}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  <div className="flex flex-wrap gap-1">
                    {u.departmentIds.map(dId => {
                      const dept = departments.find(d => d.id === dId);
                      return (
                        <span key={dId} className="inline-flex items-center rounded-md bg-surface px-1.5 py-0.5 text-xs font-medium text-foreground ring-1 ring-inset ring-border whitespace-nowrap">
                          {dept?.name || dId}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {u.active ? (
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
                    onClick={() => handleOpenEdit(u)}
                    className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
                    title="Edit user"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit User" : "Add New User"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Work Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Designation</label>
                <input
                  value={formData.designation}
                  onChange={e => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {errors.designation && <p className="text-xs text-red-500">{errors.designation}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <select
                  value={formData.role}
                  onChange={e => {
                    const role = e.target.value as Role;
                    let departmentIds = formData.departmentIds;
                    if (role === "employee" && departmentIds.length > 1) {
                      departmentIds = [departmentIds[0]];
                    }
                    setFormData({ ...formData, role, departmentIds });
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Departments</label>
              <div className="max-h-40 overflow-y-auto rounded-md border border-input p-2 space-y-1">
                {departments.filter(d => !d.deleted).map(d => (
                  <label key={d.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.departmentIds.includes(d.id)}
                      onChange={() => toggleDept(d.id)}
                      disabled={formData.role === "employee" && !formData.departmentIds.includes(d.id) && formData.departmentIds.length >= 1}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    {d.name}
                  </label>
                ))}
              </div>
              {errors.departmentIds && <p className="text-xs text-red-500">{errors.departmentIds}</p>}
              <p className="text-xs text-muted-foreground">
                {formData.role === "employee" ? "Employees can only be assigned to a single department." : "Managers and Admins can be assigned to multiple departments."}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={e => setFormData({ ...formData, active: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="active" className="text-sm font-medium text-foreground">
                Account is active
              </label>
            </div>
            
            {!formData.active && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 flex gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Deactivated users cannot sign in. Their historical data and approvals will remain intact.
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
                {isEditing ? "Save Changes" : "Create User"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
