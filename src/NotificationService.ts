import { BehaviorSubject, Observable } from 'rxjs';

export type ISOString = string;

export type Notification = {
    title: string;
    message: string;
    date: ISOString;
    priority: 'low' | 'medium' | 'high';
    read: boolean;
};

export class NotificationService {
    private notifications: Notification[] = [];
    private notificationsSubject: BehaviorSubject<Notification[]> = new BehaviorSubject(this.notifications);
    private unreadCountSubject: BehaviorSubject<number> = new BehaviorSubject(0);

    send(notification: Notification): void {
        this.notifications.push(notification);
        this.updateUnreadCount();
        this.notificationsSubject.next(this.notifications);
        if (notification.priority !== 'low') {
            this.showDialog(notification);
        }
    }

    list(): Observable<Notification[]> {
        return this.notificationsSubject.asObservable();
    }

    unreadCount(): Observable<number> {
        return this.unreadCountSubject.asObservable();
    }

    markAsRead(index: number): void {
        if (this.notifications[index]) {
            this.notifications[index].read = true;
            this.updateUnreadCount();
            this.notificationsSubject.next(this.notifications);
        }
    }

    private updateUnreadCount(): void {
        const unreadCount = this.notifications.filter(notification => !notification.read).length;
        this.unreadCountSubject.next(unreadCount);
    }

    private showDialog(notification: Notification): void {
        alert(`New notification: ${notification.title}\n${notification.message}`);
    }
}
