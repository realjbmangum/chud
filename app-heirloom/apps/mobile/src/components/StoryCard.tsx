import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { Colors, Typography } from '@/constants';
import { formatDuration, getCategoryColor } from '@/constants/mockData';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface StoryCardProps {
  story: {
    id: string;
    title: string;
    category: string;
    mediaType: 'audio' | 'video' | 'photo';
    duration?: number;
    thumbnail?: string;
    createdBy?: { name: string; avatar: string | null };
  };
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
}

export function StoryCard({ story, size = 'medium', onPress }: StoryCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const dimensions = {
    small: { width: 140, height: 180 },
    medium: { width: 160, height: 200 },
    large: { width: 200, height: 240 },
  };

  const { width, height } = dimensions[size];
  const categoryColor = getCategoryColor(story.category);

  return (
    <AnimatedPressable
      style={[animatedStyle, styles.container, { width, height }]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      {story.thumbnail ? (
        <Image source={{ uri: story.thumbnail }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnailPlaceholder, { backgroundColor: categoryColor + '20' }]}>
          <Ionicons
            name={story.mediaType === 'video' ? 'videocam' : 'mic'}
            size={32}
            color={categoryColor}
          />
        </View>
      )}

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.gradient}
      />

      {/* Media Type Badge */}
      <View style={styles.mediaBadge}>
        <Ionicons
          name={story.mediaType === 'video' ? 'videocam' : story.mediaType === 'audio' ? 'mic' : 'image'}
          size={12}
          color={Colors.white}
        />
        {story.duration && (
          <Text style={styles.duration}>{formatDuration(story.duration)}</Text>
        )}
      </View>

      {/* Category Tag */}
      <View style={[styles.categoryTag, { backgroundColor: categoryColor }]}>
        <Text style={styles.categoryText}>
          {story.category.charAt(0).toUpperCase() + story.category.slice(1)}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {story.title}
        </Text>
        {story.createdBy && (
          <View style={styles.author}>
            <View style={styles.authorAvatar}>
              <Ionicons name="person" size={10} color={Colors.white} />
            </View>
            <Text style={styles.authorName}>{story.createdBy.name}</Text>
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.charcoalInk,
  },
  thumbnail: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  mediaBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  duration: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.white,
  },
  categoryTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  title: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: Colors.white,
    lineHeight: 18,
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  authorAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
});
