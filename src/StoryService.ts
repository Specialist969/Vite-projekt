import { Story, StoryState, Priority } from "./Story";

export class StoryService {
    private storiesKey = 'stories';

    createStory(story: Story): void {
        const stories = this.getStories();
        stories.push(story);
        this.saveStories(stories);
    }

    getStories(): Story[] {
        return JSON.parse(localStorage.getItem(this.storiesKey) || '[]');
    }

    getStoriesByProject(projectId: number): Story[] {
        return this.getStories().filter(story => story.projekt.id === projectId);
    }

    updateStory(story: Story): void {
        const stories = this.getStories();
        const index = stories.findIndex(s => s.id === story.id);
        if (index !== -1) {
            stories[index] = story;
            this.saveStories(stories);
        }
    }

    deleteStory(id: number): void {
        const stories = this.getStories();
        const filteredStories = stories.filter(s => s.id !== id);
        this.saveStories(filteredStories);
    }

    private saveStories(stories: Story[]): void {
        localStorage.setItem(this.storiesKey, JSON.stringify(stories));
    }
}
export { Story, StoryState, Priority };

