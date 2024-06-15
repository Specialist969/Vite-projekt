import { Task, TaskState } from './Task';

export class TaskService {
    private tasksKey = 'tasks';

    createTask(task: Task): void {
        const tasks = this.getTasks();
        tasks.push(task);
        this.saveTasks(tasks);
    }

    getTasks(): Task[] {
        return JSON.parse(localStorage.getItem(this.tasksKey) || '[]');
    }

    getTasksByStory(storyId: number): Task[] {
        return this.getTasks().filter(task => task.story.id === storyId);
    }

    updateTask(task: Task): void {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
            tasks[index] = task;
            this.saveTasks(tasks);
        }
    }

    deleteTask(id: number): void {
        const tasks = this.getTasks();
        const filteredTasks = tasks.filter(task => task.id !== id);
        this.saveTasks(filteredTasks);
    }

    changeTaskState(taskId: number, newState: TaskState): void {
        const task = this.getTasks().find(t => t.id === taskId);
        if (task) {
            task.state = newState;
            if (newState === TaskState.Doing) {
                task.startAt = new Date();
            } else if (newState === TaskState.Done) {
                task.completedAt = new Date();
            }
            this.updateTask(task);
        }
    }

    private saveTasks(tasks: Task[]): void {
        localStorage.setItem(this.tasksKey, JSON.stringify(tasks));
    }
}

export { Task, TaskState };
