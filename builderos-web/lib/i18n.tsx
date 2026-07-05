"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import type { TaskStatus } from "@/lib/types";

export type Language = "en" | "mn";

const dictionaries: Record<Language, Record<string, string>> = {
  en: {
    "app.name": "BuilderOS",
    "app.subtitle": "Projects, tasks, and notes in one calm workspace.",
    "nav.dashboard": "Dashboard",
    "nav.projects": "Projects",
    "nav.tasks": "Tasks",
    "nav.notes": "Notes",
    "auth.login": "Login",
    "auth.register": "Register",
    "auth.logout": "Logout",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.displayName": "Display name",
    "auth.loginTitle": "Welcome back",
    "auth.registerTitle": "Create your workspace",
    "auth.loginAction": "Sign in",
    "auth.registerAction": "Create account",
    "auth.noAccount": "Need an account?",
    "auth.hasAccount": "Already registered?",
    "common.create": "Create",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.loading": "Loading",
    "common.empty": "Nothing here yet.",
    "common.updated": "Updated",
    "common.description": "Description",
    "common.title": "Title",
    "common.language": "Language",
    "common.english": "English",
    "common.mongolian": "Mongolian",
    "dashboard.title": "Dashboard",
    "dashboard.recentProjects": "Recent projects",
    "dashboard.recentTasks": "Recent tasks",
    "dashboard.status": "Task status",
    "dashboard.todo": "Todo",
    "dashboard.inProgress": "In progress",
    "dashboard.done": "Done",
    "projects.title": "Projects",
    "projects.new": "New project",
    "projects.name": "Project name",
    "projects.detail": "Project detail",
    "projects.open": "Open project",
    "tasks.title": "Tasks",
    "tasks.new": "New task",
    "tasks.status": "Status",
    "tasks.project": "Project",
    "tasks.noProject": "No project",
    "tasks.dueDate": "Due date",
    "tasks.status.TODO": "Todo",
    "tasks.status.IN_PROGRESS": "In progress",
    "tasks.status.DONE": "Done",
    "notes.title": "Notes",
    "notes.new": "New note",
    "notes.content": "Markdown",
    "notes.preview": "Preview",
    "notes.detail": "Note detail",
    "errors.generic": "Something went wrong.",
  },
  mn: {
    "app.name": "BuilderOS",
    "app.subtitle": "Төсөл, ажил, тэмдэглэлээ нэг тайван орчинд удирд.",
    "nav.dashboard": "Хянах самбар",
    "nav.projects": "Төслүүд",
    "nav.tasks": "Ажлууд",
    "nav.notes": "Тэмдэглэл",
    "auth.login": "Нэвтрэх",
    "auth.register": "Бүртгүүлэх",
    "auth.logout": "Гарах",
    "auth.email": "Имэйл",
    "auth.password": "Нууц үг",
    "auth.displayName": "Нэр",
    "auth.loginTitle": "Тавтай морил",
    "auth.registerTitle": "Ажлын орчноо үүсгэ",
    "auth.loginAction": "Нэвтрэх",
    "auth.registerAction": "Бүртгүүлэх",
    "auth.noAccount": "Бүртгэл хэрэгтэй юу?",
    "auth.hasAccount": "Бүртгэлтэй юу?",
    "common.create": "Үүсгэх",
    "common.save": "Хадгалах",
    "common.cancel": "Болих",
    "common.delete": "Устгах",
    "common.edit": "Засах",
    "common.loading": "Ачаалж байна",
    "common.empty": "Одоогоор хоосон байна.",
    "common.updated": "Шинэчилсэн",
    "common.description": "Тайлбар",
    "common.title": "Гарчиг",
    "common.language": "Хэл",
    "common.english": "Англи",
    "common.mongolian": "Монгол",
    "dashboard.title": "Хянах самбар",
    "dashboard.recentProjects": "Сүүлийн төслүүд",
    "dashboard.recentTasks": "Сүүлийн ажлууд",
    "dashboard.status": "Ажлын төлөв",
    "dashboard.todo": "Хийх",
    "dashboard.inProgress": "Хийгдэж буй",
    "dashboard.done": "Дууссан",
    "projects.title": "Төслүүд",
    "projects.new": "Шинэ төсөл",
    "projects.name": "Төслийн нэр",
    "projects.detail": "Төслийн дэлгэрэнгүй",
    "projects.open": "Төслийг нээх",
    "tasks.title": "Ажлууд",
    "tasks.new": "Шинэ ажил",
    "tasks.status": "Төлөв",
    "tasks.project": "Төсөл",
    "tasks.noProject": "Төсөлгүй",
    "tasks.dueDate": "Дуусах огноо",
    "tasks.status.TODO": "Хийх",
    "tasks.status.IN_PROGRESS": "Хийгдэж буй",
    "tasks.status.DONE": "Дууссан",
    "notes.title": "Тэмдэглэл",
    "notes.new": "Шинэ тэмдэглэл",
    "notes.content": "Markdown",
    "notes.preview": "Урьдчилж харах",
    "notes.detail": "Тэмдэглэлийн дэлгэрэнгүй",
    "errors.generic": "Алдаа гарлаа.",
  },
};

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  statusLabel: (status: TaskStatus) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    const stored = window.localStorage.getItem("builderos_language");
    return stored === "en" || stored === "mn" ? stored : "en";
  });

  const value = useMemo<I18nContextValue>(() => {
    const setLanguage = (nextLanguage: Language) => {
      setLanguageState(nextLanguage);
      window.localStorage.setItem("builderos_language", nextLanguage);
    };

    const t = (key: string) => dictionaries[language][key] ?? dictionaries.en[key] ?? key;

    return {
      language,
      setLanguage,
      t,
      statusLabel: (status) => t(`tasks.status.${status}`),
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return value;
}
