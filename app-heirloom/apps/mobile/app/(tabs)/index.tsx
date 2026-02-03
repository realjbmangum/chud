import { View, Text, StyleSheet, Pressable, ScrollView, FlatList } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Typography, MOCK_STORIES, MOCK_FAMILY_STORIES, MOCK_TIME_CAPSULES, MOCK_PROMPTS } from '@/constants';
import { StoryCard, PromptCard, TimeCapsuleCard } from '@/components';
import { useState } from 'react';

export default function HomeScreen() {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const currentPrompt = MOCK_PROMPTS[currentPromptIndex];

  const handleChangePrompt = () => {
    setCurrentPromptIndex((prev) => (prev + 1) % MOCK_PROMPTS.length);
  };

  const handleRecord = () => {
    router.push('/record');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Daily Prompt Card */}
      <Animated.View entering={FadeInDown.duration(500).delay(100)}>
        <PromptCard
          prompt={currentPrompt.text}
          category={currentPrompt.category}
          onRecord={handleRecord}
          onChangePrompt={handleChangePrompt}
        />
      </Animated.View>

      {/* My Vault Preview */}
      <Animated.View
        entering={FadeInDown.duration(500).delay(200)}
        style={styles.section}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="folder" size={20} color={Colors.heritageGreen} />
            <Text style={styles.sectionTitle}>My Vault</Text>
          </View>
          <Link href="/vault" asChild>
            <Pressable style={styles.seeAllButton}>
              <Text style={styles.seeAll}>See all</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.heritageGreen} />
            </Pressable>
          </Link>
        </View>

        {MOCK_STORIES.length > 0 ? (
          <FlatList
            horizontal
            data={MOCK_STORIES.slice(0, 5)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <StoryCard story={item} size="medium" />
            )}
            contentContainerStyle={styles.storyList}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={40} color={Colors.heritageGreen + '30'} />
            <Text style={styles.emptyText}>Your stories will appear here</Text>
            <Text style={styles.emptySubtext}>Record your first memory to get started</Text>
          </View>
        )}
      </Animated.View>

      {/* Time Capsules */}
      <Animated.View
        entering={FadeInDown.duration(500).delay(300)}
        style={styles.section}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="time" size={20} color={Colors.heritageGreen} />
            <Text style={styles.sectionTitle}>Time Capsules</Text>
          </View>
          <Pressable style={styles.addButton}>
            <Ionicons name="add" size={20} color={Colors.heritageGreen} />
          </Pressable>
        </View>

        {MOCK_TIME_CAPSULES.length > 0 ? (
          <FlatList
            horizontal
            data={MOCK_TIME_CAPSULES}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TimeCapsuleCard capsule={item} />
            )}
            contentContainerStyle={styles.capsuleList}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          />
        ) : (
          <Pressable style={styles.createCapsuleCard}>
            <View style={styles.createCapsuleIcon}>
              <Ionicons name="time-outline" size={28} color={Colors.heritageGreen} />
            </View>
            <View style={styles.createCapsuleContent}>
              <Text style={styles.createCapsuleTitle}>Create a Time Capsule</Text>
              <Text style={styles.createCapsuleSubtitle}>
                Schedule stories to be revealed on a future date
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.charcoalInk + '40'} />
          </Pressable>
        )}
      </Animated.View>

      {/* Family Vault Preview */}
      <Animated.View
        entering={FadeInDown.duration(500).delay(400)}
        style={styles.section}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="people" size={20} color={Colors.heritageGreen} />
            <Text style={styles.sectionTitle}>Family Vault</Text>
          </View>
          <Link href="/family" asChild>
            <Pressable style={styles.seeAllButton}>
              <Text style={styles.seeAll}>See all</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.heritageGreen} />
            </Pressable>
          </Link>
        </View>

        {MOCK_FAMILY_STORIES.length > 0 ? (
          <FlatList
            horizontal
            data={MOCK_FAMILY_STORIES}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <StoryCard story={item} size="medium" />
            )}
            contentContainerStyle={styles.storyList}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          />
        ) : (
          <Pressable style={styles.inviteFamilyCard}>
            <View style={styles.inviteFamilyIcon}>
              <Ionicons name="people-outline" size={28} color={Colors.heritageGreen} />
            </View>
            <View style={styles.inviteFamilyContent}>
              <Text style={styles.inviteFamilyTitle}>Invite your family</Text>
              <Text style={styles.inviteFamilySubtitle}>
                Share stories and build your legacy together
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.charcoalInk + '40'} />
          </Pressable>
        )}
      </Animated.View>

      {/* Bottom spacing */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ivoryLinen,
  },
  content: {
    padding: 20,
  },
  section: {
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
    color: Colors.charcoalInk,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAll: {
    fontSize: Typography.sizes.sm,
    color: Colors.heritageGreen,
    fontWeight: '500',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.heritageGreen + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyList: {
    paddingRight: 20,
  },
  capsuleList: {
    paddingRight: 20,
  },
  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: Typography.sizes.base,
    fontWeight: '500',
    color: Colors.charcoalInk,
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: Typography.sizes.sm,
    color: Colors.charcoalInk + '60',
  },
  createCapsuleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.charcoalInk,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  createCapsuleIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.heritageGreen + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  createCapsuleContent: {
    flex: 1,
  },
  createCapsuleTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.charcoalInk,
    marginBottom: 2,
  },
  createCapsuleSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.charcoalInk + '60',
  },
  inviteFamilyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.charcoalInk,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  inviteFamilyIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.heritageGreen + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  inviteFamilyContent: {
    flex: 1,
  },
  inviteFamilyTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.charcoalInk,
    marginBottom: 2,
  },
  inviteFamilySubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.charcoalInk + '60',
  },
});
