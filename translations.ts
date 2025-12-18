
import { Translations } from './types';

export const translations: Record<'en' | 'pt', Translations> = {
  en: {
    welcome: "WELCOME TO YOUR READER!",
    subtitle: "Your collection awaits. Add a file to start a new adventure.",
    uploadButton: "UPLOAD EDITION",
    allEditions: "ALL EDITIONS",
    noEditions: "No Editions Found",
    noEditionsSub: "Upload a PDF, EPUB or CBZ to start your collection.",
    home: "Home",
    uploadLabel: "Upload .PDF/.EPUB/.CBZ",
    language: "English",
    themeToggle: "Dark Mode",
    back: "Back",
    lastRead: "Read on",
    favorites: "Favorites"
  },
  pt: {
    welcome: "BEM-VINDO AO SEU LEITOR!",
    subtitle: "Sua coleção aguarda. Adicione um arquivo para começar uma nova aventura.",
    uploadButton: "ENVIAR EDIÇÃO",
    allEditions: "TODAS AS EDIÇÕES",
    noEditions: "Nenhuma Edição Encontrada",
    noEditionsSub: "Envie um PDF, EPUB ou CBZ para começar sua coleção.",
    home: "Início",
    uploadLabel: "Enviar .PDF/.EPUB/.CBZ",
    language: "Português",
    themeToggle: "Modo Escuro",
    back: "Voltar",
    lastRead: "Lido em",
    favorites: "Favoritos"
  }
};
