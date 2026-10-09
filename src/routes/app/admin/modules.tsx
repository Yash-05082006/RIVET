import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useRivet } from "../../../lib/rivet/store";
import { Plus, Edit2, ShieldAlert, Trash2, GripVertical } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import type { ModuleDef, ModuleField, Role, FieldType } from "../../../lib/rivet/types";

export const Route = createFileRoute("/app/admin/modules")({
  component: ModulesAdminPage,
});

function ModulesAdminPage() {
  const { modules, departments, createModule, updateModule } = useRivet();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState("");

  const [formData, setFormData] = useState<Partial<ModuleDef>>({
    name: "",
    description: "",
    departmentId: "",
    cadence: "daily",
    createRoles: ["employee", "manager", "admin"],
    scope: "department",
    active: true,
    fields: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingKey("");
    setFormData({
      name: "",
      description: "",
      departmentId: departments[0]?.id || "",
      cadence: "daily",
      createRoles: ["employee", "manager", "admin"],
      scope: "department",
      active: true,
      fields: [
        { key: "field1", label: "Example Field", type: "text", required: true },
      ],
    });
    setErrors({});
    setIsOpen(true);
  };

  const handleOpenEdit = (m: ModuleDef) => {
    setIsEditing(true);
    setEditingKey(m.key);
    setFormData({ ...m });
    setErrors({});
    setIsOpen(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = "Required";
    if (!formData.description?.trim()) newErrors.description = "Required";
    if (!formData.departmentId) newErrors.departmentId = "Required";
    
    if (!formData.fields || formData.fields.length === 0) {
      newErrors.fields = "At least one field is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing) {
      updateModule(editingKey, formData as ModuleDef);
    } else {
      const newKey = formData.name!.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      createModule({
        ...(formData as Omit<ModuleDef, "key">),
      });
    }
    setIsOpen(false);
  };

  const addField = () => {
    setFormData((prev: Partial<ModuleDef>) => ({
      ...prev,
      fields: [...(prev.fields || []), { key: `field_${Date.now()}`, label: "New Field", type: "text", required: false }]
    }));
  };

  const updateField = (index: number, updates: Partial<ModuleField>) => {
    setFormData((prev: Partial<ModuleDef>) => {
      const newFields = [...(prev.fields || [])];
      newFields[index] = { ...newFields[index], ...updates };
      return { ...prev, fields: newFields };
    });
  };

  const removeField = (index: number) => {
    setFormData((prev: Partial<ModuleDef>) => {
      const newFields = [...(prev.fields || [])];
      newFields.splice(index, 1);
      return { ...prev, fields: newFields };
    });
  };

  const toggleRole = (type: "createRoles", role: Role) => {
    setFormData((prev: Partial<ModuleDef>) => {
      const list = prev[type] || [];
      if (list.includes(role)) {
        return { ...prev, [type]: list.filter((r: Role) => r !== role) };
      } else {
        return { ...prev, [type]: [...list, role] };
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Modules</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure data entry modules, forms, and permission scopes.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" /> Add Module
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-background shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-border bg-surface text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Module Name</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Cadence</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {modules.map(m => {
              const dept = departments.find(d => d.id === m.departmentId);
              return (
                <tr key={m.key} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {m.name}
                    <div className="text-xs font-normal text-muted-foreground line-clamp-1">{m.description}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {dept?.name || m.departmentId}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{m.cadence}</td>
                  <td className="px-4 py-3">
                    {m.active ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
                      title="Edit module"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Module" : "Create New Module"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            
            {/* General Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">General Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Module Name</label>
                  <input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="e.g. Daily Sales Log"
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>
                
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <input
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Assigned Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select a department...</option>
                    {departments.filter(d => d.active && !d.deleted).map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  {errors.departmentId && <p className="text-xs text-red-500">{errors.departmentId}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Submission Cadence</label>
                  <select
                    value={formData.cadence}
                    onChange={e => setFormData({ ...formData, cadence: e.target.value as any })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="ad-hoc">Ad-hoc</option>
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Access & Scope */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Access &amp; Permissions</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Scope</label>
                  <select
                    value={formData.scope}
                    onChange={e => setFormData({ ...formData, scope: e.target.value as any })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="personal">Personal (Own data only)</option>
                    <option value="department">Department (Visible to entire dept)</option>
                    <option value="global">Global (Visible to all active users)</option>
                  </select>
                </div>

                <div></div> {/* spacer */}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Who can submit entries?</label>
                  <div className="flex gap-4 mt-1">
                    {["employee", "manager", "admin"].map(role => (
                      <label key={role} className="flex items-center gap-1.5 text-sm capitalize">
                        <input
                          type="checkbox"
                          checked={formData.createRoles?.includes(role as Role)}
                          onChange={() => toggleRole("createRoles", role as Role)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        {role}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Fields Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Module Fields</h3>
                <button
                  type="button"
                  onClick={addField}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  + Add Field
                </button>
              </div>
              
              {errors.fields && <p className="text-xs text-red-500">{errors.fields}</p>}

              <div className="space-y-3">
                {formData.fields?.map((field: ModuleField, index: number) => (
                  <div key={index} className="flex items-start gap-3 rounded-md border border-border bg-surface/50 p-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground shrink-0 mt-1.5 cursor-move opacity-50" />
                    
                    <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground">Field Label</label>
                        <input
                          value={field.label}
                          onChange={e => {
                            const newLabel = e.target.value;
                            updateField(index, { 
                              label: newLabel, 
                              key: newLabel.toLowerCase().replace(/[^a-z0-9]/g, '_') || `field_${index}`
                            });
                          }}
                          className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:border-primary focus:outline-none"
                          placeholder="e.g. Sales Revenue"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Type</label>
                        <select
                          value={field.type}
                          onChange={e => updateField(index, { type: e.target.value as FieldType })}
                          className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:border-primary focus:outline-none"
                        >
                          <option value="text">Short Text</option>
                          <option value="longtext">Long Text</option>
                          <option value="number">Number</option>
                          <option value="select">Select (Dropdown)</option>
                          <option value="checkbox">Checkbox</option>
                          <option value="date">Date</option>
                        </select>
                      </div>

                      <div className="space-y-1 flex items-end pb-1">
                        <label className="flex items-center gap-1.5 text-sm">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={e => updateField(index, { required: e.target.checked })}
                            className="rounded border-border text-primary focus:ring-primary"
                          />
                          Required
                        </label>
                      </div>

                      {field.type === "select" && (
                        <div className="space-y-1 sm:col-span-4 mt-1">
                          <label className="text-xs font-medium text-muted-foreground">Options (comma separated)</label>
                          <input
                            value={field.options?.join(", ") || ""}
                            onChange={e => updateField(index, { options: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                            className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:border-primary focus:outline-none"
                            placeholder="e.g. Option A, Option B, Option C"
                          />
                        </div>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      className="text-muted-foreground hover:text-red-600 transition-colors mt-1.5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-border" />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active-mod"
                checked={formData.active}
                onChange={e => setFormData({ ...formData, active: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="active-mod" className="text-sm font-medium text-foreground">
                Module is active and available for entries
              </label>
            </div>

            <DialogFooter className="pt-4 border-t border-border">
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
                {isEditing ? "Save Changes" : "Create Module"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
