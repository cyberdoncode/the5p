"use client";

import { useState } from "react";
import { format } from "date-fns";
import { api, cx, useResource } from "@/lib/client";
import type { Goal, Task } from "@/lib/types";
import { Badge, Button, Checkbox, EmptyState, Field, Input, Modal, Panel, Progress, Select, Textarea } from "@/components/ui";
import { Icon } from "@/components/icons";

export default function GoalsPage() {
  const goals = useResource<Goal[]>("/api/goals");
  const tasks = useResource<Task[]>("/api/tasks");
  const [goalModal, setGoalModal] = useState(false);
  const [projectModal, setProjectModal] = useState<string | null>(null);
  const [goalForm, setGoalForm] = useState({ title: "", why: "", horizon: "year", targetDate: "" });
  const [projectForm, setProjectForm] = useState({ name: "", description: "" });
  const [expanded, setExpanded] = useState<string | null>(null);

  async function createGoal() {
    if (!goalForm.title.trim()) return;
    await api("/api/goals", {
      method: "POST",
      body: {
        title: goalForm.title,
        why: goalForm.why || null,
        horizon: goalForm.horizon,
        targetDate: goalForm.targetDate ? new Date(goalForm.targetDate).toISOString() : null,
      },
    });
    setGoalForm({ title: "", why: "", horizon: "year", targetDate: "" });
    setGoalModal(false);
    await goals.reload();
  }

  async function createProject(goalId: string) {
    if (!projectForm.name.trim()) return;
    await api("/api/projects", {
      method: "POST",
      body: { name: projectForm.name, description: projectForm.description || null, goalId },
    });
    setProjectForm({ name: "", description: "" });
    setProjectModal(null);
    await goals.reload();
  }

  async function addMilestone(projectId: string) {
    const title = window.prompt("Milestone");
    if (!title) return;
    await api("/api/milestones", { method: "POST", body: { projectId, title } });
    await goals.reload();
  }

  async function toggleMilestone(id: string, done: boolean) {
    await api(`/api/milestones/${id}`, { method: "PATCH", body: { done } });
    await goals.reload();
  }

  async function addTask(projectId: string, milestoneId: string | null) {
    const title = window.prompt("Task");
    if (!title) return;
    await api("/api/tasks", { method: "POST", body: { title, projectId, milestoneId } });
    await Promise.all([goals.reload(), tasks.reload()]);
  }

  async function toggleTask(task: Task) {
    const done = task.status !== "done";
    await api(`/api/tasks/${task.id}`, {
      method: "PATCH",
      body: { status: done ? "done" : "todo", completedAt: done ? new Date().toISOString() : null },
    });
    await Promise.all([goals.reload(), tasks.reload()]);
  }

  async function removeGoal(id: string) {
    await api(`/api/goals/${id}`, { method: "DELETE" });
    await goals.reload();
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4 rise">
        <div>
          <p className="eyebrow">Direction</p>
          <h1 className="display mt-3 text-4xl">Goals</h1>
          <p className="mt-3 max-w-lg text-muted">
            Goal → Project → Milestones → Tasks. Ambition broken down until it&apos;s just work.
          </p>
        </div>
        <Button variant="primary" onClick={() => setGoalModal(true)}>
          <Icon name="plus" size={14} /> New goal
        </Button>
      </header>

      {(goals.data ?? []).length === 0 && !goals.loading ? (
        <EmptyState title="No goals yet" hint="Start with the one that would change everything." />
      ) : null}

      <div className="space-y-5">
        {(goals.data ?? []).map((goal) => {
          const allTasks = goal.projects.flatMap((project) => project.tasks);
          const done = allTasks.filter((task) => task.status === "done").length;
          const value = allTasks.length ? (done / allTasks.length) * 100 : goal.progress;
          const isOpen = expanded === goal.id;
          return (
            <Panel key={goal.id} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <Badge tone="accent">{goal.horizon}</Badge>
                    {goal.targetDate ? (
                      <span className="font-mono text-[11px] text-faint">
                        by {format(new Date(goal.targetDate), "d MMM yyyy")}
                      </span>
                    ) : null}
                  </div>
                  <h2 className="display mt-3 text-2xl">{goal.title}</h2>
                  {goal.why ? <p className="mt-2 max-w-xl text-sm text-muted">{goal.why}</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => setProjectModal(goal.id)}>
                    <Icon name="plus" size={13} /> Project
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setExpanded(isOpen ? null : goal.id)}>
                    {isOpen ? "Collapse" : "Expand"}
                  </Button>
                  <button onClick={() => removeGoal(goal.id)} className="text-faint hover:text-[var(--danger)]">
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-4">
                <div className="flex-1">
                  <Progress value={value} />
                </div>
                <span className="font-mono text-xs text-faint">
                  {Math.round(value)}% · {done}/{allTasks.length} tasks
                </span>
              </div>

              {isOpen ? (
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {goal.projects.length === 0 ? (
                    <EmptyState title="No projects" hint="What is the vehicle for this goal?" />
                  ) : null}
                  {goal.projects.map((project) => {
                    const projectTasks = (tasks.data ?? []).filter((task) => task.projectId === project.id);
                    return (
                      <div key={project.id} className="rounded-2xl border border-[var(--line)] p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{project.name}</div>
                          <div className="flex gap-1">
                            <button onClick={() => addMilestone(project.id)} className="text-[11px] text-faint hover:text-fg">
                              + milestone
                            </button>
                            <button onClick={() => addTask(project.id, null)} className="ml-2 text-[11px] text-faint hover:text-fg">
                              + task
                            </button>
                          </div>
                        </div>
                        {project.description ? (
                          <p className="mt-1 text-xs text-faint">{project.description}</p>
                        ) : null}

                        <div className="mt-3 space-y-1.5">
                          {project.milestones.map((milestone) => (
                            <div key={milestone.id} className="flex items-center gap-2">
                              <Checkbox
                                checked={milestone.done}
                                size={15}
                                onChange={(checked) => toggleMilestone(milestone.id, checked)}
                              />
                              <span className={cx("text-xs", milestone.done && "text-faint line-through")}>
                                {milestone.title}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 space-y-1 border-t border-[var(--line)] pt-3">
                          {projectTasks.length === 0 ? (
                            <p className="text-[11px] text-faint">No tasks yet.</p>
                          ) : (
                            projectTasks.map((task) => (
                              <div key={task.id} className="flex items-center gap-2">
                                <Checkbox checked={task.status === "done"} size={15} onChange={() => toggleTask(task)} />
                                <span className={cx("truncate text-xs", task.status === "done" && "text-faint line-through")}>
                                  {task.title}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </Panel>
          );
        })}
      </div>

      <Modal open={goalModal} onClose={() => setGoalModal(false)} title="New goal">
        <Field label="Goal">
          <Input value={goalForm.title} onChange={(value) => setGoalForm({ ...goalForm, title: value })} autoFocus placeholder="Build a profitable software career" />
        </Field>
        <Field label="Why it matters">
          <Textarea value={goalForm.why} onChange={(value) => setGoalForm({ ...goalForm, why: value })} rows={3} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Horizon">
            <Select
              className="w-full"
              value={goalForm.horizon}
              onChange={(value) => setGoalForm({ ...goalForm, horizon: value })}
              options={[
                { value: "quarter", label: "Quarter" },
                { value: "year", label: "Year" },
                { value: "life", label: "Life" },
              ]}
            />
          </Field>
          <Field label="Target date">
            <Input type="date" value={goalForm.targetDate} onChange={(value) => setGoalForm({ ...goalForm, targetDate: value })} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={() => setGoalModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={createGoal}>Create goal</Button>
        </div>
      </Modal>

      <Modal open={projectModal !== null} onClose={() => setProjectModal(null)} title="New project">
        <Field label="Project">
          <Input value={projectForm.name} onChange={(value) => setProjectForm({ ...projectForm, name: value })} autoFocus placeholder="Build THE5P" />
        </Field>
        <Field label="Description">
          <Textarea value={projectForm.description} onChange={(value) => setProjectForm({ ...projectForm, description: value })} rows={3} />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={() => setProjectModal(null)}>Cancel</Button>
          <Button variant="primary" onClick={() => projectModal && createProject(projectModal)}>Create project</Button>
        </div>
      </Modal>
    </div>
  );
}
