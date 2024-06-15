import { User } from './User';
import { Project } from './Project';

export enum StoryState {
    Todo = 'todo',
    Doing = 'doing',
    Done = 'done'
}

export enum Priority {
    Low = 'low',
    Medium = 'medium',
    High = 'high'
}

export class Story {
    id: number;
    nazwa: string;
    opis: string;
    priorytet: Priority;
    projekt: Project;
    dataUtworzenia: Date;
    stan: StoryState;
    wlasciciel: User;

    constructor(id: number, nazwa: string, opis: string, priorytet: Priority, projekt: Project, dataUtworzenia: Date, stan: StoryState, wlasciciel: User) {
        this.id = id;
        this.nazwa = nazwa;
        this.opis = opis;
        this.priorytet = priorytet;
        this.projekt = projekt;
        this.dataUtworzenia = dataUtworzenia;
        this.stan = stan;
        this.wlasciciel = wlasciciel;
    }
}
