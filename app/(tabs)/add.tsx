import 'react-native-get-random-values';
import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Experience } from '@/models/Experience';
import { ExperienceStorage } from '@/services/ExperienceStorage';

export default function AddExperienceScreen() {
  const [negativeExperience, setNegativeExperience] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!negativeExperience.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const newExperience: Experience = {
        id: uuidv4(),
        date: new Date().toISOString(),
        negativeExperience: negativeExperience.trim(),
      };

      await ExperienceStorage.saveExperience(newExperience);
      router.replace('/');
    } catch (error) {
      console.error('Error saving experience:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerTitle="Add Experience">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Record a Negative Experience</ThemedText>
            <ThemedText style={styles.instruction}>
              Write down a negative experience you've had. You'll have the opportunity to reflect on what you've learned from it after a week, and what benefits came from it after a month.
            </ThemedText>
            
            <TextInput
              style={styles.textInput}
              placeholder="Describe your negative experience..."
              placeholderTextColor="#999"
              value={negativeExperience}
              onChangeText={setNegativeExperience}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </ThemedView>

          <ThemedView style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!negativeExperience.trim() || isSubmitting) && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={!negativeExperience.trim() || isSubmitting}
            >
              <ThemedText style={styles.submitButtonText}>
                {isSubmitting ? 'Saving...' : 'Save Experience'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  instruction: {
    marginTop: 8,
    marginBottom: 16,
    opacity: 0.8,
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    minHeight: 120,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  submitButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    width: '80%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
