export enum UserRole {
    Admin = 'admin',
    DevOps = 'devops',
    Developer = 'developer'
}

export class User {
    id: number;
    imie: string;
    nazwisko: string;
    rola: UserRole;

    constructor(id: number, imie: string, nazwisko: string, rola: UserRole) {
        this.id = id;
        this.imie = imie;
        this.nazwisko = nazwisko;
        this.rola = rola;
    }
}
