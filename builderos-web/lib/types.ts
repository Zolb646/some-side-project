export type User = {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
};

export type AuthSession = {
  expiresIn: number;
  user: User;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type Task = {
  id: string;
  projectId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Note = {
  id: string;
  title: string;
  contentMarkdown: string;
  createdAt: string;
  updatedAt: string;
};

export type Dashboard = {
  recentProjects: Project[];
  recentTasks: Task[];
  taskStatusCounts: {
    todo: number;
    inProgress: number;
    done: number;
  };
};
