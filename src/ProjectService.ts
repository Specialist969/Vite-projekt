import { Project } from "../src/Project";

export class ProjectService {
    private projectsKey = 'projects';
    private activeProjectKey = 'activeProject';

    createProject(project: Project): void {
        const projects = this.getProjects();
        projects.push(project);
        this.saveProjects(projects);
    }

    getProjects(): Project[] {
        return JSON.parse(localStorage.getItem(this.projectsKey) || '[]');
    }

    updateProject(project: Project): void {
        const projects = this.getProjects();
        const index = projects.findIndex(p => p.id === project.id);
        if (index !== -1) {
            projects[index] = project;
            this.saveProjects(projects);
        }
    }

    deleteProject(id: number): void {
        const projects = this.getProjects();
        const filteredProjects = projects.filter(p => p.id !== id);
        this.saveProjects(filteredProjects);
    }

    setActiveProject(project: Project): void {
        localStorage.setItem(this.activeProjectKey, JSON.stringify(project));
    }

    getActiveProject(): Project | null {
        const project = localStorage.getItem(this.activeProjectKey);
        return project ? JSON.parse(project) : null;
    }

    private saveProjects(projects: Project[]): void {
        localStorage.setItem(this.projectsKey, JSON.stringify(projects));
    }
}
export { Project };

