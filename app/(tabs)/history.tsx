import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Experience, ExperienceStage, getExperienceStage } from '@/models/Experience';
import { ExperienceStorage } from '@/services/ExperienceStorage';

export default function HistoryScreen() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    setLoading(true);
    try {
      const data = await ExperienceStorage.getExperiences();
      // Sort by date, newest first
      const sortedData = [...data].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setExperiences(sortedData);
    } catch (error) {
      console.error('Error loading experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageLabel = (stage: ExperienceStage) => {
    switch (stage) {
      case ExperienceStage.INITIAL:
        return 'Recorded';
      case ExperienceStage.LESSON:
        return 'Lesson Added';
      case ExperienceStage.COMPLETED:
        return 'Completed';
      default:
        return '';
    }
  };

  const getStageColor = (stage: ExperienceStage) => {
    switch (stage) {
      case ExperienceStage.INITIAL:
        return '#ff9800'; // Orange
      case ExperienceStage.LESSON:
        return '#2196f3'; // Blue
      case ExperienceStage.COMPLETED:
        return '#4caf50'; // Green
      default:
        return '#999999';
    }
  };

  const renderExperienceItem = ({ item }: { item: Experience }) => {
    const stage = getExperienceStage(item);
    
    return (
      <TouchableOpacity
        style={styles.experienceCard}
        onPress={() => router.push(`/experience/${item.id}`)}
      >
        <ThemedView style={styles.cardHeader}>
          <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.experienceText}>
            {item.negativeExperience}
          </ThemedText>
          <ThemedView 
            style={[
              styles.stageBadge, 
              { backgroundColor: getStageColor(stage) }
            ]}
          >
            <ThemedText style={styles.stageText}>
              {getStageLabel(stage)}
            </ThemedText>
          </ThemedView>
        </ThemedView>
        
        <ThemedText style={styles.dateText}>
          Recorded on {new Date(item.date).toLocaleDateString()}
        </ThemedText>
        
        {item.lesson && (
          <ThemedView style={styles.reflectionSection}>
            <ThemedText type="defaultSemiBold">Lesson:</ThemedText>
            <ThemedText numberOfLines={2}>{item.lesson}</ThemedText>
          </ThemedView>
        )}
        
        {item.benefit && (
          <ThemedView style={styles.reflectionSection}>
            <ThemedText type="defaultSemiBold">Benefit:</ThemedText>
            <ThemedText numberOfLines={2}>{item.benefit}</ThemedText>
          </ThemedView>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerTitle="Experience History">
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Your Growth Journey
        </ThemedText>
        
        {experiences.length > 0 ? (
          <FlatList
            data={experiences}
            renderItem={renderExperienceItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <ThemedView style={styles.emptyState}>
            <ThemedText>You haven't recorded any experiences yet.</ThemedText>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/add')}
            >
              <ThemedText style={styles.addButtonText}>Add Your First Experience</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  experienceCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  experienceText: {
    flex: 1,
    marginRight: 8,
  },
  stageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  stageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
    marginBottom: 8,
    opacity: 0.6,
  },
  reflectionSection: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 4,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    gap: 16,
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
