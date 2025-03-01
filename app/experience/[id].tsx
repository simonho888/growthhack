import 'react-native-get-random-values';
import { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Experience, isReadyForLesson, isReadyForBenefit } from '@/models/Experience';
import { ExperienceStorage } from '@/services/ExperienceStorage';

export default function ExperienceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [lesson, setLesson] = useState('');
  const [benefit, setBenefit] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadExperience(id);
    }
  }, [id]);

  const loadExperience = async (experienceId: string) => {
    setLoading(true);
    try {
      const data = await ExperienceStorage.getExperienceById(experienceId);
      if (data) {
        setExperience(data);
        setLesson(data.lesson || '');
        setBenefit(data.benefit || '');
      }
    } catch (error) {
      console.error('Error loading experience:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLesson = async () => {
    if (!experience || !lesson.trim()) return;

    setSaving(true);
    try {
      const updatedExperience = {
        ...experience,
        lesson: lesson.trim(),
        lessonDate: new Date().toISOString(),
      };
      
      await ExperienceStorage.saveExperience(updatedExperience);
      setExperience(updatedExperience);
      Alert.alert('Success', 'Your lesson has been saved.');
    } catch (error) {
      console.error('Error saving lesson:', error);
      Alert.alert('Error', 'Failed to save your lesson. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBenefit = async () => {
    if (!experience || !benefit.trim()) return;

    setSaving(true);
    try {
      const updatedExperience = {
        ...experience,
        benefit: benefit.trim(),
        benefitDate: new Date().toISOString(),
      };
      
      await ExperienceStorage.saveExperience(updatedExperience);
      setExperience(updatedExperience);
      Alert.alert('Success', 'Your benefit has been saved.');
    } catch (error) {
      console.error('Error saving benefit:', error);
      Alert.alert('Error', 'Failed to save your benefit. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!experience) return;

    Alert.alert(
      'Delete Experience',
      'Are you sure you want to delete this experience? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ExperienceStorage.deleteExperience(experience.id);
              Alert.alert('Success', 'Experience deleted successfully');
              router.replace('/');
            } catch (error) {
              console.error('Error deleting experience:', error);
              Alert.alert('Error', 'Failed to delete experience');
            }
          },
        },
      ]
    );
  };

  if (loading || !experience) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  const canAddLesson = isReadyForLesson(experience);
  const canAddBenefit = isReadyForBenefit(experience);
  const creationDate = new Date(experience.date);
  const lessonDate = experience.lessonDate ? new Date(experience.lessonDate) : null;

  // Calculate when lesson and benefit can be added
  const lessonAvailableDate = new Date(creationDate);
  lessonAvailableDate.setDate(creationDate.getDate() + 7);
  
  const benefitAvailableDate = lessonDate ? new Date(lessonDate) : null;
  if (benefitAvailableDate) {
    benefitAvailableDate.setMonth(benefitAvailableDate.getMonth() + 1);
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Experience Details',
          headerShown: true,
        }} 
      />
      <ScrollView style={styles.container}>
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Negative Experience</ThemedText>
          <ThemedText style={styles.dateText}>
            Recorded on {creationDate.toLocaleDateString()}
          </ThemedText>
          <ThemedView style={styles.experienceBox}>
            <ThemedText>{experience.negativeExperience}</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Lesson Learned</ThemedText>
          {experience.lesson ? (
            <>
              <ThemedText style={styles.dateText}>
                Added on {new Date(experience.lessonDate!).toLocaleDateString()}
              </ThemedText>
              <ThemedView style={styles.experienceBox}>
                <ThemedText>{experience.lesson}</ThemedText>
              </ThemedView>
            </>
          ) : canAddLesson ? (
            <>
              <ThemedText style={styles.instructionText}>
                It's been a week since you recorded this experience. What lesson have you learned from it?
              </ThemedText>
              <TextInput
                style={styles.textInput}
                placeholder="What did you learn from this experience?"
                placeholderTextColor="#999"
                value={lesson}
                onChangeText={setLesson}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!lesson.trim() || saving) && styles.disabledButton
                ]}
                onPress={handleSaveLesson}
                disabled={!lesson.trim() || saving}
              >
                <ThemedText style={styles.saveButtonText}>
                  {saving ? 'Saving...' : 'Save Lesson'}
                </ThemedText>
              </TouchableOpacity>
            </>
          ) : (
            <ThemedText style={styles.waitingText}>
              You can add your lesson on {lessonAvailableDate.toLocaleDateString()}
            </ThemedText>
          )}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Benefit Gained</ThemedText>
          {experience.benefit ? (
            <>
              <ThemedText style={styles.dateText}>
                Added on {new Date(experience.benefitDate!).toLocaleDateString()}
              </ThemedText>
              <ThemedView style={styles.experienceBox}>
                <ThemedText>{experience.benefit}</ThemedText>
              </ThemedView>
            </>
          ) : experience.lesson ? (
            canAddBenefit ? (
              <>
                <ThemedText style={styles.instructionText}>
                  It's been a month since you added your lesson. What benefit came from this experience?
                </ThemedText>
                <TextInput
                  style={styles.textInput}
                  placeholder="What benefit came from this experience?"
                  placeholderTextColor="#999"
                  value={benefit}
                  onChangeText={setBenefit}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    (!benefit.trim() || saving) && styles.disabledButton
                  ]}
                  onPress={handleSaveBenefit}
                  disabled={!benefit.trim() || saving}
                >
                  <ThemedText style={styles.saveButtonText}>
                    {saving ? 'Saving...' : 'Save Benefit'}
                  </ThemedText>
                </TouchableOpacity>
              </>
            ) : (
              <ThemedText style={styles.waitingText}>
                You can add the benefit on {benefitAvailableDate?.toLocaleDateString()}
              </ThemedText>
            )
          ) : (
            <ThemedText style={styles.waitingText}>
              First add your lesson, then come back to add the benefit.
            </ThemedText>
          )}
        </ThemedView>

        <ThemedView style={styles.deleteContainer}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <ThemedText style={styles.deleteButtonText}>Delete Experience</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  dateText: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    opacity: 0.6,
  },
  experienceBox: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  instructionText: {
    marginVertical: 8,
    fontStyle: 'italic',
  },
  waitingText: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#fff9c4',
    borderRadius: 8,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    minHeight: 100,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  deleteContainer: {
    marginTop: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  deleteButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  deleteButtonText: {
    color: '#f44336',
  },
});
