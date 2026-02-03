import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Typography } from '@/constants';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TimeCapsuleCardProps {
  capsule: {
    id: string;
    title: string;
    releaseAt: string;
    recipientCount: number;
    storyCount: number;
  };
  onPress?: () => void;
}

export function TimeCapsuleCard({ capsule, onPress }: TimeCapsuleCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const releaseDate = new Date(capsule.releaseAt);
  const now = new Date();
  const daysUntil = Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const formatReleaseDate = () => {
    return releaseDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <AnimatedPressable
      style={[styles.container, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <LinearGradient
        colors={[Colors.heritageGreen, '#0A2E24']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      <View style={styles.iconContainer}>
        <Ionicons name="time" size={24} color={Colors.heirloomGold} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {capsule.title}
        </Text>
        <Text style={styles.releaseDate}>
          Opens {formatReleaseDate()}
        </Text>
      </View>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Ionicons name="film-outline" size={14} color={Colors.ivoryLinen + '80'} />
          <Text style={styles.metaText}>{capsule.storyCount}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="people-outline" size={14} color={Colors.ivoryLinen + '80'} />
          <Text style={styles.metaText}>{capsule.recipientCount}</Text>
        </View>
      </View>

      <View style={styles.countdown}>
        <Text style={styles.countdownNumber}>{daysUntil}</Text>
        <Text style={styles.countdownLabel}>days</Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 120,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.ivoryLinen,
    marginBottom: 4,
  },
  releaseDate: {
    fontSize: Typography.sizes.xs,
    color: Colors.ivoryLinen + '80',
  },
  meta: {
    position: 'absolute',
    bottom: 16,
    left: 78,
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: Typography.sizes.xs,
    color: Colors.ivoryLinen + '80',
  },
  countdown: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  countdownNumber: {
    fontSize: Typography.sizes.xl,
    fontWeight: '700',
    color: Colors.heirloomGold,
  },
  countdownLabel: {
    fontSize: 10,
    color: Colors.ivoryLinen + '80',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
