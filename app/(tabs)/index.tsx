import { StyleSheet, Platform, FlatList, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Experience, ExperienceStage, getExperienceStage, isReadyForBenefit, isReadyForLesson } from '@/models/Experience';
import { ExperienceStorage } from '@/services/ExperienceStorage';

export default function HomeScreen() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    setLoading(true);
    try {
      const data = await ExperienceStorage.getExperiences();
      setExperiences(data);
    } catch (error) {
      console.error('Error loading experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionableExperiences = () => {
    return experiences.filter(exp => 
      isReadyForLesson(exp) || isReadyForBenefit(exp)
    );
  };

  const actionableExperiences = getActionableExperiences();

  const renderExperienceItem = ({ item }: { item: Experience }) => {
    const stage = getExperienceStage(item);
    let actionText = '';
    
    if (isReadyForLesson(item)) {
      actionText = 'Add your lesson from this experience';
    } else if (isReadyForBenefit(item)) {
      actionText = 'Add the benefit from this experience';
    }

    return (
      <TouchableOpacity
        style={styles.experienceCard}
        onPress={() => router.push(`/experience/${item.id}`)}
      >
        <ThemedText type="defaultSemiBold" numberOfLines={2}>{item.negativeExperience}</ThemedText>
        <ThemedText style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</ThemedText>
        {actionText ? (
          <ThemedView style={styles.actionBanner}>
            <ThemedText style={styles.actionText}>{actionText}</ThemedText>
          </ThemedView>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerTitle="Growth Journal">
      <ThemedView style={styles.container}>
        <ThemedView style={styles.section}>
          <ThemedText type="title">Welcome to Growth Journal</ThemedText>
          <ThemedText style={styles.subtitle}>
            Record negative experiences, learn from them, and discover their benefits over time.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Ready for Reflection</ThemedText>
          {actionableExperiences.length > 0 ? (
            <FlatList
              data={actionableExperiences}
              renderItem={renderExperienceItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          ) : (
            <ThemedView style={styles.emptyState}>
              <ThemedText>No experiences ready for reflection yet.</ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        <ThemedView style={styles.addButtonContainer}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/add')}
          >
            <ThemedText style={styles.addButtonText}>Add New Experience</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.8,
  },
  experienceCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  dateText: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.6,
  },
  actionBanner: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#e0f7fa',
    borderRadius: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#00838f',
  },
  emptyState: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  addButtonContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  addButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
