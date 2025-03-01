import AsyncStorage from '@react-native-async-storage/async-storage';
import { Experience } from '../models/Experience';

const STORAGE_KEY = 'growth_experiences';

export const ExperienceStorage = {
  async saveExperience(experience: Experience): Promise<void> {
    try {
      const existingExperiences = await this.getExperiences();
      
      // Check if experience already exists
      const index = existingExperiences.findIndex(e => e.id === experience.id);
      
      if (index !== -1) {
        // Update existing experience
        existingExperiences[index] = experience;
      } else {
        // Add new experience
        existingExperiences.push(experience);
      }
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existingExperiences));
    } catch (error) {
      console.error('Error saving experience:', error);
      throw error;
    }
  },
  
  async getExperiences(): Promise<Experience[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting experiences:', error);
      return [];
    }
  },
  
  async getExperienceById(id: string): Promise<Experience | null> {
    try {
      const experiences = await this.getExperiences();
      return experiences.find(e => e.id === id) || null;
    } catch (error) {
      console.error('Error getting experience by ID:', error);
      return null;
    }
  },
  
  async deleteExperience(id: string): Promise<void> {
    try {
      const experiences = await this.getExperiences();
      const filteredExperiences = experiences.filter(e => e.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredExperiences));
    } catch (error) {
      console.error('Error deleting experience:', error);
      throw error;
    }
  },
  
  async clearAllExperiences(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing experiences:', error);
      throw error;
    }
  }
};
