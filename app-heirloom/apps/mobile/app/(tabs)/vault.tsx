import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useState } from 'react';
import { Colors, Typography, MOCK_STORIES } from '@/constants';
import { StoryCard } from '@/components';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'childhood', label: 'Childhood', icon: 'happy' },
  { id: 'career', label: 'Career', icon: 'briefcase' },
  { id: 'family', label: 'Family', icon: 'heart' },
  { id: 'faith', label: 'Faith', icon: 'leaf' },
  { id: 'legacy', label: 'Legacy', icon: 'star' },
];

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2; // 20px padding each side + 12px gap

export default function VaultScreen() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredStories = activeCategory === 'all'
    ? MOCK_STORIES
    : MOCK_STORIES.filter((s) => s.category === activeCategory);

  const handleCategoryPress = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveCategory(categoryId);
  };

  return (
    <View style={styles.container}>
      {/* Category Filter */}
      <Animated.View entering={FadeIn.duration(300)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {CATEGORIES.map((category) => (
            <Pressable
              key={category.id}
              style={[
                styles.filterPill,
                activeCategory === category.id && styles.filterPillActive,
              ]}
              onPress={() => handleCategoryPress(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={16}
                color={activeCategory === category.id ? Colors.ivoryLinen : Colors.heritageGreen}
              />
              <Text
                style={[
                  styles.filterText,
                  activeCategory === category.id && styles.filterTextActive,
                ]}
              >
                {category.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Stories Grid */}
      {filteredStories.length > 0 ? (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <Text style={styles.storyCount}>
              {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
            </Text>
            <Pressable style={styles.sortButton}>
              <Ionicons name="swap-vertical" size={16} color={Colors.heritageGreen} />
              <Text style={styles.sortText}>Recent</Text>
            </Pressable>
          </View>

          {/* Grid */}
          <View style={styles.grid}>
            {filteredStories.map((story, index) => (
              <Animated.View
                key={story.id}
                entering={FadeInUp.duration(400).delay(index * 80)}
                style={styles.gridItem}
              >
                <StoryCard
                  story={story}
                  size="large"
                  onPress={() => {}}
                />
              </Animated.View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.emptyState}
        >
          <View style={styles.emptyIconContainer}>
            <Ionicons
              name="folder-open-outline"
              size={56}
              color={Colors.heritageGreen + '40'}
            />
          </View>
          <Text style={styles.emptyTitle}>No stories yet</Text>
          <Text style={styles.emptySubtitle}>
            {activeCategory === 'all'
              ? 'Record your first story to start building your legacy'
              : `No ${activeCategory} stories yet. Record one now!`}
          </Text>
          <Link href="/record" asChild>
            <Pressable style={styles.recordButton}>
              <Ionicons name="mic" size={20} color={Colors.white} />
              <Text style={styles.recordButtonText}>Record a Story</Text>
            </Pressable>
          </Link>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ivoryLinen,
  },
  filterContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.heritageGreen + '10',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.heritageGreen + '08',
  },
  filterPillActive: {
    backgroundColor: Colors.heritageGreen,
  },
  filterText: {
    fontSize: Typography.sizes.sm,
    color: Colors.heritageGreen,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.ivoryLinen,
  },
  content: {
    flex: 1,
  },
  gridContent: {
    padding: 20,
    paddingBottom: 100,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  storyCount: {
    fontSize: Typography.sizes.sm,
    color: Colors.charcoalInk + '80',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: Typography.sizes.sm,
    color: Colors.heritageGreen,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.25,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    paddingBottom: 100,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.heritageGreen + '08',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: '600',
    color: Colors.charcoalInk,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.charcoalInk + '70',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  recordButton: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.heirloomGold,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: Colors.heirloomGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  recordButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.white,
  },
});
