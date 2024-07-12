export enum UserRole {
    Admin = 'admin',
    DevOps = 'devops',
    Developer = 'developer'
}

export class User {
    id: number;
    username: string;
    password: string;
    imie: string;
    nazwisko: string;
    rola: UserRole;

    constructor(id: number, username: string, password: string, imie: string, nazwisko: string, rola: UserRole) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.imie = imie;
        this.nazwisko = nazwisko;
        this.rola = rola;
    }
}
