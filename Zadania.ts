import { Project, ProjectService } from './src/ProjectService';

const projectService = new ProjectService();

// Dodanie nowego projektu
const newProject = new Project(1, 'Nazwa projektu', 'Opis projektu');
projectService.createProject(newProject);

// Pobranie wszystkich projektów
const projects = projectService.getProjects();
console.log(projects);

// Aktualizacja istniejącego projektu
const projectToUpdate = projects[0];
projectToUpdate.opis = 'Nowy opis projektu';
projectService.updateProject(projectToUpdate);

// Usunięcie projektu
const projectIdToDelete = 1;
projectService.deleteProject(projectIdToDelete);
