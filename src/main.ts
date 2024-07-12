import { Project, ProjectService } from './ProjectService';
import { UserService, UserRole } from './UserService';
import { Story, StoryService, StoryState, Priority } from './StoryService';
import { Task, TaskService, TaskState } from './TaskService';
import { NotificationService, Notification } from './NotificationService';
import { TaskPriority } from './Task';

const projectService = new ProjectService();
const userService = new UserService();
const storyService = new StoryService();
const taskService = new TaskService();
const notificationService = new NotificationService();

userService.mockUsers();

const currentUserElement = document.getElementById('current-user') as HTMLSpanElement;
const logoutButton = document.getElementById('logout-button') as HTMLButtonElement;
const userInfoSection = document.getElementById('user-info') as HTMLDivElement;
const registrationForm = document.getElementById('registration-form') as HTMLFormElement;
const loginForm = document.getElementById('login-form') as HTMLFormElement;
const projectList = document.getElementById('project-list') as HTMLUListElement;
const addProjectForm = document.getElementById('add-project-form') as HTMLFormElement;
const storyList = document.getElementById('story-list') as HTMLUListElement;
const addStoryForm = document.getElementById('add-story-form') as HTMLFormElement;
const taskList = document.getElementById('task-list') as HTMLUListElement;
const addTaskForm = document.getElementById('add-task-form') as HTMLFormElement;

function updateUIBasedOnLoginStatus() {
    const currentUser = userService.getCurrentUser();
    if (currentUser) {
        userInfoSection.style.display = 'block';
        loginForm.style.display = 'none';
        registrationForm.style.display = 'none';
        currentUserElement.innerText = `Logged in as: ${currentUser.username}`;
    } else {
        userInfoSection.style.display = 'none';
        loginForm.style.display = 'block';
        registrationForm.style.display = 'block';
    }
}
updateUIBasedOnLoginStatus();

logoutButton.addEventListener('click', () => {
    userService.logout();
    updateUIBasedOnLoginStatus();
    window.location.reload();
});

registrationForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = (document.getElementById('register-username') as HTMLInputElement).value;
    const password = (document.getElementById('register-password') as HTMLInputElement).value;
    const firstName = (document.getElementById('register-first-name') as HTMLInputElement).value;
    const lastName = (document.getElementById('register-last-name') as HTMLInputElement).value;
    const role = (document.getElementById('register-role') as HTMLSelectElement).value as UserRole;

    userService.register(username, password, firstName, lastName, role);
    updateUIBasedOnLoginStatus();
});

loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = (document.getElementById('login-username') as HTMLInputElement).value;
    const password = (document.getElementById('login-password') as HTMLInputElement).value;
    if (userService.login(username, password)) {
        updateUIBasedOnLoginStatus();
        window.location.reload();
    } else {
        alert('Invalid login credentials');
    }
});

const currentUser = userService.getCurrentUser();
if (!currentUser) {
    alert('Brak zalogowanego użytkownika');
    throw new Error('Brak zalogowanego użytkownika');
}

currentUserElement.innerText = `Logged in as: ${currentUser.username}`;

function createProjectElement(project: Project): HTMLLIElement {
    const li = document.createElement('li');
    li.innerHTML = `
        <strong>${project.nazwa}</strong>: ${project.opis}
        <button onclick="selectProject(${project.id})">Wybierz</button>
        <button onclick="editProject(${project.id})">Edytuj</button>
        <button onclick="deleteProject(${project.id})">Usuń</button>
    `;
    return li;
}

function renderProjects() {
    projectList.innerHTML = '';
    const projects = projectService.getProjects();
    projects.forEach(project => {
        const projectElement = createProjectElement(project);
        projectList.appendChild(projectElement);
    });
}

addProjectForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const projectNameInput = document.getElementById('project-name') as HTMLInputElement;
    const projectDescriptionInput = document.getElementById('project-description') as HTMLInputElement;
    const projectName = projectNameInput.value;
    const projectDescription = projectDescriptionInput.value;
    const newProject = new Project(Date.now(), projectName, projectDescription);
    projectService.createProject(newProject);
    renderProjects();
    projectNameInput.value = '';
    projectDescriptionInput.value = '';

    sendNotification('New Project Added', `Project "${projectName}" has been added.`, 'medium');
});

(window as any).editProject = (projectId: number) => {
    const projectToUpdate = projectService.getProjects().find(project => project.id === projectId);
    if (!projectToUpdate) return;
    const updatedName = prompt('Wprowadź nową nazwę projektu:', projectToUpdate.nazwa);
    const updatedDescription = prompt('Wprowadź nowy opis projektu:', projectToUpdate.opis);
    if (updatedName && updatedDescription) {
        projectToUpdate.nazwa = updatedName;
        projectToUpdate.opis = updatedDescription;
        projectService.updateProject(projectToUpdate);
        renderProjects();
    }
};

// Funkcja obsługująca usuwanie projektu
(window as any).deleteProject = (projectId: number) => {
    if (confirm('Czy na pewno chcesz usunąć ten projekt?')) {
        projectService.deleteProject(projectId);
        renderProjects();
        renderActiveProject();
    }
};

// Funkcja wybierająca aktywny projekt
(window as any).selectProject = (projectId: number) => {
    const selectedProject = projectService.getProjects().find(project => project.id === projectId);
    if (selectedProject) {
        projectService.setActiveProject(selectedProject);
        renderActiveProject();
    }
};

// Funkcja aktualizująca widok aktywnego projektu
function renderActiveProject() {
    const activeProject = projectService.getActiveProject();
    if (!activeProject) {
        alert('Nie wybrano aktywnego projektu');
        return;
    }
    document.getElementById('active-project-name')!.innerText = activeProject.nazwa;
    renderStories();
    populateStorySelect(); // <-- Dodaj to wywołanie
    populateUserSelect(); // <-- Dodaj to wywołanie
}

// Funkcja tworząca element historyjki
function createStoryElement(story: Story): HTMLLIElement {
    const li = document.createElement('li');
    li.innerHTML = `
        <strong>${story.nazwa}</strong>: ${story.opis} (Priorytet: ${story.priorytet})
        <button onclick="editStory(${story.id})">Edytuj</button>
        <button onclick="deleteStory(${story.id})">Usuń</button>
        <button onclick="viewTasks(${story.id})">Zobacz zadania</button>
    `;
    return li;
}

// Funkcja aktualizująca listę historyjek na stronie
function renderStories() {
    storyList.innerHTML = '';
    const activeProject = projectService.getActiveProject();
    if (!activeProject) return;
    const stories = storyService.getStoriesByProject(activeProject.id);
    stories.forEach(story => {
        const storyElement = createStoryElement(story);
        storyList.appendChild(storyElement);
    });
}

// Obsługa dodawania nowej historyjki
addStoryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const storyNameInput = document.getElementById('story-name') as HTMLInputElement;
    const storyDescriptionInput = document.getElementById('story-description') as HTMLInputElement;
    const storyPrioritySelect = document.getElementById('story-priority') as HTMLSelectElement;
    const storyName = storyNameInput.value;
    const storyDescription = storyDescriptionInput.value;
    const storyPriority = storyPrioritySelect.value as Priority;
    const activeProject = projectService.getActiveProject();
    if (!activeProject) {
        alert('Nie wybrano aktywnego projektu');
        return;
    }
    const newStory = new Story(
        Date.now(),
        storyName,
        storyDescription,
        storyPriority,
        activeProject,
        new Date(),
        StoryState.Todo,
        userService.getCurrentUser()!
    );
    storyService.createStory(newStory);
    renderStories();
    populateStorySelect(); // <-- Dodaj to wywołanie
    storyNameInput.value = '';
    storyDescriptionInput.value = '';
});

// Funkcja obsługująca edycję historyjki
(window as any).editStory = (storyId: number) => {
    const storyToUpdate = storyService.getStories().find(story => story.id === storyId);
    if (!storyToUpdate) return;
    const updatedName = prompt('Wprowadź nową nazwę historyjki:', storyToUpdate.nazwa);
    const updatedDescription = prompt('Wprowadź nowy opis historyjki:', storyToUpdate.opis);
    const updatedPriority = prompt('Wprowadź nowy priorytet historyjki (low, medium, high):', storyToUpdate.priorytet);
    if (updatedName && updatedDescription && updatedPriority) {
        storyToUpdate.nazwa = updatedName;
        storyToUpdate.opis = updatedDescription;
        storyToUpdate.priorytet = updatedPriority as Priority;
        storyService.updateStory(storyToUpdate);
        renderStories();
    }
};

// Funkcja obsługująca usuwanie historyjki
(window as any).deleteStory = (storyId: number) => {
    if (confirm('Czy na pewno chcesz usunąć tę historyjkę?')) {
        storyService.deleteStory(storyId);
        renderStories();
        populateStorySelect(); // <-- Dodaj to wywołanie
    }
};

// Funkcja wyświetlająca zadania dla wybranej historyjki
(window as any).viewTasks = (storyId: number) => {
    renderTasks(storyId);
};

// Funkcja aktualizująca listę zadań na stronie
function renderTasks(storyId: number) {
    taskList.innerHTML = '';
    const tasks = taskService.getTasksByStory(storyId);
    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });
}

// Obsługa dodawania nowego zadania
addTaskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const taskNameInput = document.getElementById('task-name') as HTMLInputElement;
    const taskDescriptionInput = document.getElementById('task-description') as HTMLInputElement;
    const taskPrioritySelect = document.getElementById('task-priority') as HTMLSelectElement;
    const taskName = taskNameInput.value;
    const taskDescription = taskDescriptionInput.value;
    const taskPriority = taskPrioritySelect.value as TaskPriority;
    const storySelect = document.getElementById('story-select') as HTMLSelectElement;
    const storyId = parseInt(storySelect.value);
    const activeStory = storyService.getStories().find(story => story.id === storyId);
    if (!activeStory) {
        alert('Nie wybrano aktywnej historyjki');
        return;
    }
    const taskEstimatedTimeInput = document.getElementById('task-estimated-time') as HTMLInputElement;
    const taskEstimatedTime = parseInt(taskEstimatedTimeInput.value);
    const assignedUser = userService.getCurrentUser();
    if (!assignedUser) {
        alert('Nie wybrano użytkownika');
        return;
    }
    const newTask = new Task(
        Date.now(),
        taskName,
        taskDescription,
        taskPriority,
        activeStory,
        taskEstimatedTime, // Przewidywany czas w godzinach jako liczba
        TaskState.Todo,
        new Date(), // Data dodania jako Date
        undefined, // Data startu (opcjonalnie)
        undefined, // Data zakończenia (opcjonalnie)
        assignedUser // Użytkownik przypisany do zadania
    );
    taskService.createTask(newTask);
    renderTasks(activeStory.id);
    taskNameInput.value = '';
    taskDescriptionInput.value = '';
    taskEstimatedTimeInput.value = '';
});

// Funkcja wypełniająca listę rozwijaną historyjek
function populateStorySelect() {
    const storySelect = document.getElementById('story-select') as HTMLSelectElement;
    storySelect.innerHTML = ''; // Clear existing options
    const activeProject = projectService.getActiveProject();
    if (!activeProject) return;

    const stories = storyService.getStoriesByProject(activeProject.id);
    stories.forEach(story => {
        const option = document.createElement('option');
        option.value = story.id.toString();
        option.textContent = story.nazwa;
        storySelect.appendChild(option);
    });
}

// Funkcja wypełniająca listę rozwijaną użytkowników
function populateUserSelect() {
    const userSelect = document.getElementById('user-select') as HTMLSelectElement;
    userSelect.innerHTML = ''; // Clear existing options
    const users = userService.getUsers();
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id.toString();
        option.textContent = `${user.imie} (${user.rola})`;
        userSelect.appendChild(option);
    });
}

// Funkcja renderująca tablicę Kanban
function renderKanbanBoard() {
    const todoTasksElement = document.getElementById('todo-tasks') as HTMLUListElement;
    const doingTasksElement = document.getElementById('doing-tasks') as HTMLUListElement;
    const doneTasksElement = document.getElementById('done-tasks') as HTMLUListElement;

    todoTasksElement.innerHTML = '';
    doingTasksElement.innerHTML = '';
    doneTasksElement.innerHTML = '';

    const tasks = taskService.getTasks();
    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        switch(task.state) {
            case TaskState.Todo:
                todoTasksElement.appendChild(taskElement);
                break;
            case TaskState.Doing:
                doingTasksElement.appendChild(taskElement);
                break;
            case TaskState.Done:
                doneTasksElement.appendChild(taskElement);
                break;
        }
    });
}

// Funkcja obsługująca przenoszenie zadań między kolumnami
function moveTask(taskId: number, newState: TaskState) {
    const task = taskService.getTasks().find(t => t.id === taskId);
    if (task) {
        task.state = newState; // Zmiana stanu zadania
        if (newState === TaskState.Doing) {
            task.startAt = new Date(); // Ustawienie daty rozpoczęcia
        } else if (newState === TaskState.Done) {
            task.completedAt = new Date(); // Ustawienie daty zakończenia
        }
        taskService.updateTask(task); // Aktualizacja zadania
        renderKanbanBoard(); // Odświeżanie tablicy Kanban
    }
}
(window as any).moveTask = moveTask;

// Uaktualnienie funkcji createTaskElement do włączenia przycisków przenoszenia
function createTaskElement(task: Task): HTMLLIElement {
    const li = document.createElement('li');
    li.innerHTML = `
        <strong>${task.nazwa}</strong>: ${task.opis} (Priorytet: ${task.priorytet})
       ${task.state === TaskState.Todo ? `<button onclick="moveTask(${task.id}, '${TaskState.Doing}')">Przenieś do Doing</button>` : ''}
       ${task.state === TaskState.Doing ? `<button onclick="moveTask(${task.id}, '${TaskState.Done}')">Przenieś do Done</button>` : ''}
        <button onclick="editTask(${task.id})">Edytuj</button>
        <button onclick="deleteTask(${task.id})">Usuń</button>
    `;
    return li;
}

// Funkcja obsługująca edycję zadania
(window as any).editTask = (taskId: number) => {
    const taskToUpdate = taskService.getTasks().find(task => task.id === taskId);
    if (!taskToUpdate) return;

    const updatedName = prompt('Wprowadź nową nazwę zadania:', taskToUpdate.nazwa);
    const updatedDescription = prompt('Wprowadź nowy opis zadania:', taskToUpdate.opis);
    const updatedPriority = prompt('Wprowadź nowy priorytet zadania (low, medium, high):', taskToUpdate.priorytet);

    const estimatedTimeString = prompt('Wprowadź nowy przewidywany czas (w godzinach):', taskToUpdate.przewidywanyCzas.toString());
    const updatedEstimatedTime = estimatedTimeString ? parseInt(estimatedTimeString, 10) : NaN;

    if (updatedName && updatedDescription && updatedPriority && !isNaN(updatedEstimatedTime)) {
        taskToUpdate.nazwa = updatedName;
        taskToUpdate.opis = updatedDescription;
        taskToUpdate.priorytet = updatedPriority as TaskPriority;
        taskToUpdate.przewidywanyCzas = updatedEstimatedTime;
        taskService.updateTask(taskToUpdate);
        renderKanbanBoard();
    }
};

// Funkcja obsługująca usuwanie zadania
(window as any).deleteTask = (taskId: number) => {
    if (confirm('Czy na pewno chcesz usunąć to zadanie?')) {
        taskService.deleteTask(taskId);
        renderKanbanBoard();
    }
};

document.getElementById('theme-toggle')!.addEventListener('click', () => {
    const body = document.body;
    const newTheme = body.classList.toggle('dark-mode') ? 'dark' : 'light';
    body.classList.toggle('light-mode', newTheme === 'light');
    localStorage.setItem('theme', newTheme);
});

window.onload = () => {
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.body.classList.add(savedTheme === 'dark' ? 'dark-mode' : 'light-mode');
};

function sendNotification(title: string, message: string, priority: 'low' | 'medium' | 'high') {
    const notification: Notification = {
        title,
        message,
        date: new Date().toISOString(),
        priority,
        read: false
    };
    notificationService.send(notification);
}

userService.mockUsers();

addProjectForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const projectNameInput = document.getElementById('project-name') as HTMLInputElement;
    const projectDescriptionInput = document.getElementById('project-description') as HTMLInputElement;
    const projectName = projectNameInput.value;
    const projectDescription = projectDescriptionInput.value;
    const newProject = new Project(Date.now(), projectName, projectDescription);
    projectService.createProject(newProject);
    renderProjects();
    projectNameInput.value = '';
    projectDescriptionInput.value = '';

    sendNotification('New Project Added', `Project "${projectName}" has been added.`, 'medium');
});

addStoryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const storyNameInput = document.getElementById('story-name') as HTMLInputElement;
    const storyDescriptionInput = document.getElementById('story-description') as HTMLInputElement;
    const storyPrioritySelect = document.getElementById('story-priority') as HTMLSelectElement;
    const storyName = storyNameInput.value;
    const storyDescription = storyDescriptionInput.value;
    const storyPriority = storyPrioritySelect.value as Priority;
    const activeProject = projectService.getActiveProject();
    if (!activeProject) {
        alert('Nie wybrano aktywnego projektu');
        return;
    }
    const newStory = new Story(
        Date.now(),
        storyName,
        storyDescription,
        storyPriority,
        activeProject,
        new Date(),
        StoryState.Todo,
        userService.getCurrentUser()!
    );
    storyService.createStory(newStory);
    renderStories();
    populateStorySelect();
    storyNameInput.value = '';
    storyDescriptionInput.value = '';

    sendNotification('New Story Added', `Story "${storyName}" has been added to project "${activeProject.nazwa}".`, 'medium');
});

addTaskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const taskNameInput = document.getElementById('task-name') as HTMLInputElement;
    const taskDescriptionInput = document.getElementById('task-description') as HTMLInputElement;
    const taskPrioritySelect = document.getElementById('task-priority') as HTMLSelectElement;
    const taskName = taskNameInput.value;
    const taskDescription = taskDescriptionInput.value;
    const taskPriority = taskPrioritySelect.value as TaskPriority;
    const storySelect = document.getElementById('story-select') as HTMLSelectElement;
    const storyId = parseInt(storySelect.value);
    const activeStory = storyService.getStories().find(story => story.id === storyId);
    if (!activeStory) {
        alert('Nie wybrano aktywnej historyjki');
        return;
    }
    const taskEstimatedTimeInput = document.getElementById('task-estimated-time') as HTMLInputElement;
    const taskEstimatedTime = parseInt(taskEstimatedTimeInput.value);
    const assignedUser = userService.getCurrentUser();
    if (!assignedUser) {
        alert('Nie wybrano użytkownika');
        return;
    }
    const newTask = new Task(
        Date.now(),
        taskName,
        taskDescription,
        taskPriority,
        activeStory,
        taskEstimatedTime,
        TaskState.Todo,
        new Date(),
        undefined,
        undefined,
        assignedUser
    );
    taskService.createTask(newTask);
    renderTasks(activeStory.id);
    taskNameInput.value = '';
    taskDescriptionInput.value = '';
    taskEstimatedTimeInput.value = '';

    sendNotification('New Task Added', `Task "${taskName}" has been added to story "${activeStory.nazwa}".`, 'medium');
});

const notificationCountElement = document.getElementById('notification-count') as HTMLSpanElement;

notificationService.unreadCount().subscribe((unreadCount: { toString: () => string; }) => {
    notificationCountElement.innerText = unreadCount.toString();
});

const notificationListElement = document.getElementById('notification-list') as HTMLUListElement;

notificationService.list().subscribe((notifications: any[]) => {
    notificationListElement.innerHTML = '';
    notifications.forEach((notification, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${notification.title}</strong>: ${notification.message} (Priority: ${notification.priority}) - ${notification.date}
            ${!notification.read ? '<button onclick="markAsRead(' + index + ')">Mark as read</button>' : ''}
        `;
        notificationListElement.appendChild(li);
    });
});

(window as any).markAsRead = (index: number) => {
    notificationService.markAsRead(index);
};

renderProjects();
renderActiveProject();
renderKanbanBoard();
