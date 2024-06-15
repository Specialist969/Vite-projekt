export class Project {
    id: number;
    nazwa: string;
    opis: string;

    constructor(id: number, nazwa: string, opis: string) {
        this.id = id;
        this.nazwa = nazwa;
        this.opis = opis;
    }
}
