create table users (
    id uuid primary key,
    email varchar(255) not null unique,
    display_name varchar(120) not null,
    password_hash varchar(255) not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table projects (
    id uuid primary key,
    owner_id uuid not null references users(id) on delete cascade,
    name varchar(160) not null,
    description text,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create index idx_projects_owner_updated on projects(owner_id, updated_at desc);

create table tasks (
    id uuid primary key,
    owner_id uuid not null references users(id) on delete cascade,
    project_id uuid references projects(id) on delete set null,
    title varchar(200) not null,
    description text,
    status varchar(32) not null,
    due_date date,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create index idx_tasks_owner_updated on tasks(owner_id, updated_at desc);
create index idx_tasks_owner_status on tasks(owner_id, status);
create index idx_tasks_project on tasks(project_id);

create table notes (
    id uuid primary key,
    owner_id uuid not null references users(id) on delete cascade,
    title varchar(200) not null,
    content_markdown text not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create index idx_notes_owner_updated on notes(owner_id, updated_at desc);
