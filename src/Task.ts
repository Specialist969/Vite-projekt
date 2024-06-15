import { Story } from './StoryService';
import { User } from './UserService';

export enum TaskState {
    Todo = 'Todo',
    Doing = 'Doing',
    Done = 'Done',
}

export enum TaskPriority {
    Low = 'low',
    Medium = 'medium',
    High = 'high',
}

export class Task {
    id: number;
    nazwa: string;
    opis: string;
    priorytet: TaskPriority;
    story: Story;
    przewidywanyCzas: number; // w godzinach
    state: TaskState;
    createdAt: Date;
    startAt?: Date;
    completedAt?: Date;
    assignedUser?: User;

    constructor(
        id: number,
        nazwa: string,
        opis: string,
        priorytet: TaskPriority,
        story: Story,
        przewidywanyCzas: number,
        state: TaskState,
        createdAt: Date,
        startAt?: Date,
        completedAt?: Date,
        assignedUser?: User
    ) {
        this.id = id;
        this.nazwa = nazwa;
        this.opis = opis;
        this.priorytet = priorytet;
        this.story = story;
        this.przewidywanyCzas = przewidywanyCzas;
        this.state = state;
        this.createdAt = createdAt;
        this.startAt = startAt;
        this.completedAt = completedAt;
        this.assignedUser = assignedUser;
    }
}
