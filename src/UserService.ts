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
            new User(1, 'Pawel', 'Musial', UserRole.Admin),
            new User(2, 'Marta', 'Szynka', UserRole.DevOps),
            new User(3, 'Dagmara', 'Fasolka', UserRole.Developer)
        ];
        localStorage.setItem(this.usersKey, JSON.stringify(users));
        this.mockLogin(users[0]);
    }

    register(username: string, password: string, firstName: string, lastName: string, role: UserRole): void {
        if (role !== UserRole.DevOps && role !== UserRole.Developer) {
            alert('Invalid role selected');
            return;
        }
        const users = this.getUsers();
        const newUser = new User(Date.now(), firstName, lastName, role);
        users.push(newUser);
        this.saveUsers(users);
        alert(`User ${username} registered successfully!`);
    }

    login(username: string, password: string) {
        fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        }).then(res => res.json())
            .then(({ token, refreshToken }) => {
                localStorage.setItem('jwt', token);
                localStorage.setItem('refreshToken', refreshToken);
            })
            .catch(error => console.error('Login error:', error));
    }

    refreshToken() {
        const refreshToken = localStorage.getItem('refreshToken')!;
        fetch('http://localhost:3000/refreshToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        }).then(res => res.json())
            .then(({ token, refreshToken: newRefreshToken }) => {
                localStorage.setItem('jwt', token);
                localStorage.setItem('refreshToken', newRefreshToken);
            })
            .catch(error => console.error('Token refresh error:', error));
    }

    private saveUsers(users: User[]): void {
        localStorage.setItem(this.usersKey, JSON.stringify(users));
    }
}

export { User, UserRole };
