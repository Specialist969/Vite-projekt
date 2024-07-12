import { User, UserRole } from "./User";

export class UserService {
    private currentUserKey = 'currentUser';
    private usersKey = 'users';

    mockLogin(user: User): void {
        localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    }

    getCurrentUser(): User | null {
        const user = localStorage.getItem(this.currentUserKey);
        return user ? JSON.parse(user) : null;
    }

    getUsers(): User[] {
        return JSON.parse(localStorage.getItem(this.usersKey) || '[]');
    }

    mockUsers(): void {
        const users: User[] = [
            new User(1,'PM','qwerty', 'Pawel', 'Musial', UserRole.Admin),
            new User(2,'MM', 'qwerty', 'Marta', 'Szynka', UserRole.DevOps),
            new User(3, 'DM', 'qwerty', 'Dagmara', 'Fasolka', UserRole.Developer)
        ];
        localStorage.setItem(this.usersKey, JSON.stringify(users));
        this.mockLogin(users[0]);
    }

    register(username: string, password: string, firstName: string, lastName: string, role: UserRole): void {
        const users = this.getUsers();
        if (users.find(user => user.username === username)) {
            alert('Username already exists');
            return;
        }
        const newUser = new User(Date.now(), username, password, firstName, lastName, role);
        users.push(newUser);
        this.saveUsers(users);
        alert(`User ${username} registered successfully!`);
    }

    login(username: string, password: string): boolean {
        const users = this.getUsers();
        const user = users.find(user => user.username === username && user.password === password);
        if (user) {
            localStorage.setItem(this.currentUserKey, JSON.stringify(user));
            return true;
        } else {
            alert('Invalid username or password');
            return false;
        }
    }

    logout(): void {
        localStorage.removeItem(this.currentUserKey);
    }

    private saveUsers(users: User[]): void {
        localStorage.setItem(this.usersKey, JSON.stringify(users));
    }
}

export { User, UserRole };
