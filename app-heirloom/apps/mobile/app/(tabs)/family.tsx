import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useState } from 'react';
import { Colors, Typography, MOCK_FAMILY_STORIES } from '@/constants';
import { StoryCard } from '@/components';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

const MOCK_FAMILY_MEMBERS = [
  { id: '1', name: 'Grandpa Joe', relation: 'Grandfather', stories: 12, avatar: null },
  { id: '2', name: 'Grandma Rose', relation: 'Grandmother', stories: 8, avatar: null },
  { id: '3', name: 'Uncle Mike', relation: 'Uncle', stories: 5, avatar: null },
  { id: '4', name: 'Aunt Sarah', relation: 'Aunt', stories: 3, avatar: null },
];

export default function FamilyScreen() {
  const [showStories, setShowStories] = useState(true);

  return (
    <View style={styles.container}>
      {/* Toggle */}
      <View style={styles.toggleContainer}>
        <Pressable
          style={[styles.toggleButton, showStories && styles.toggleButtonActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowStories(true);
          }}
        >
          <Ionicons
            name="play-circle"
            size={18}
            color={showStories ? Colors.ivoryLinen : Colors.heritageGreen}
          />
          <Text style={[styles.toggleText, showStories && styles.toggleTextActive]}>
            Stories
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, !showStories && styles.toggleButtonActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowStories(false);
          }}
        >
          <Ionicons
            name="people"
            size={18}
            color={!showStories ? Colors.ivoryLinen : Colors.heritageGreen}
          />
          <Text style={[styles.toggleText, !showStories && styles.toggleTextActive]}>
            Members
          </Text>
        </Pressable>
      </View>

      {showStories ? (
        MOCK_FAMILY_STORIES.length > 0 ? (
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerCard}>
              <Text style={styles.headerTitle}>What's new in your family</Text>
              <Text style={styles.headerSubtitle}>
                {MOCK_FAMILY_STORIES.length} stories from {MOCK_FAMILY_MEMBERS.length} family members
              </Text>
            </View>

            <View style={styles.grid}>
              {MOCK_FAMILY_STORIES.map((story, index) => (
                <Animated.View
                  key={story.id}
                  entering={FadeInUp.duration(400).delay(index * 80)}
                  style={styles.gridItem}
                >
                  <StoryCard story={story} size="large" />
                </Animated.View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <Animated.View entering={FadeIn.duration(400)} style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="people-outline" size={56} color={Colors.heritageGreen + '40'} />
            </View>
            <Text style={styles.emptyTitle}>No family stories yet</Text>
            <Text style={styles.emptySubtitle}>
              Invite your family to start sharing stories together
            </Text>
          </Animated.View>
        )
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.membersContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Family Members */}
          <View style={styles.membersSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Family Members</Text>
              <Text style={styles.memberCount}>{MOCK_FAMILY_MEMBERS.length}</Text>
            </View>

            {MOCK_FAMILY_MEMBERS.map((member, index) => (
              <Animated.View
                key={member.id}
                entering={FadeInUp.duration(300).delay(index * 60)}
              >
                <Pressable style={styles.memberCard}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberInitial}>
                      {member.name.split(' ').map((n) => n[0]).join('')}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberRelation}>{member.relation}</Text>
                  </View>
                  <View style={styles.memberStats}>
                    <Text style={styles.memberStoryCount}>{member.stories}</Text>
                    <Text style={styles.memberStoryLabel}>stories</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.charcoalInk + '30'} />
                </Pressable>
              </Animated.View>
            ))}
          </View>

          {/* Invite Button */}
          <Animated.View entering={FadeInUp.duration(300).delay(300)}>
            <Pressable style={styles.inviteButton}>
              <Ionicons name="person-add" size={20} color={Colors.white} />
              <Text style={styles.inviteButtonText}>Invite Family Member</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ivoryLinen,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 12,
    paddingHorizontal: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.heritageGreen + '10',
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.heritageGreen + '08',
  },
  toggleButtonActive: {
    backgroundColor: Colors.heritageGreen,
  },
  toggleText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: Colors.heritageGreen,
  },
  toggleTextActive: {
    color: Colors.ivoryLinen,
  },
  content: {
    flex: 1,
  },
  gridContent: {
    padding: 20,
    paddingBottom: 100,
  },
  headerCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.charcoalInk,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
    color: Colors.charcoalInk,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.charcoalInk + '70',
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
  membersContent: {
    padding: 20,
    paddingBottom: 100,
  },
  membersSection: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.heritageGreen + '08',
  },
  sectionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.charcoalInk,
  },
  memberCount: {
    fontSize: Typography.sizes.sm,
    color: Colors.charcoalInk + '60',
    backgroundColor: Colors.ivoryLinen,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.heritageGreen + '06',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.heritageGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberInitial: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.ivoryLinen,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: Typography.sizes.base,
    fontWeight: '500',
    color: Colors.charcoalInk,
    marginBottom: 2,
  },
  memberRelation: {
    fontSize: Typography.sizes.sm,
    color: Colors.charcoalInk + '60',
  },
  memberStats: {
    alignItems: 'center',
    marginRight: 8,
  },
  memberStoryCount: {
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
    color: Colors.heirloomGold,
  },
  memberStoryLabel: {
    fontSize: 10,
    color: Colors.charcoalInk + '50',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
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
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.heritageGreen,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: Colors.heritageGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  inviteButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.ivoryLinen,
  },
});
