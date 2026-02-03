import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Colors, Typography } from '@/constants';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PromptCardProps {
  prompt: string;
  category?: string;
  onRecord: () => void;
  onChangePrompt: () => void;
}

export function PromptCard({ prompt, category, onRecord, onChangePrompt }: PromptCardProps) {
  const buttonScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.4);

  useEffect(() => {
    // Subtle pulse animation for the record button
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handleRecord = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRecord();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.white, '#FDFCFA']}
        style={styles.gradient}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          <View style={styles.labelDot} />
          <Text style={styles.label}>TODAY'S PROMPT</Text>
        </View>
        {category && (
          <Text style={styles.category}>{category}</Text>
        )}
      </View>

      {/* Prompt Text */}
      <Text style={styles.promptText}>{prompt}</Text>

      {/* Record Button */}
      <View style={styles.recordContainer}>
        <Animated.View style={[styles.pulse, pulseStyle]} />
        <AnimatedPressable
          style={[styles.recordButton, buttonStyle]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleRecord}
        >
          <Ionicons name="mic" size={32} color={Colors.white} />
        </AnimatedPressable>
      </View>
      <Text style={styles.recordLabel}>Tap to Record</Text>

      {/* Record Options */}
      <View style={styles.options}>
        <Pressable style={styles.option}>
          <View style={styles.optionIcon}>
            <Ionicons name="mic-outline" size={22} color={Colors.heritageGreen} />
          </View>
          <Text style={styles.optionLabel}>Audio</Text>
        </Pressable>
        <Pressable style={styles.option}>
          <View style={styles.optionIcon}>
            <Ionicons name="videocam-outline" size={22} color={Colors.heritageGreen} />
          </View>
          <Text style={styles.optionLabel}>Video</Text>
        </Pressable>
        <Pressable style={styles.option}>
          <View style={styles.optionIcon}>
            <Ionicons name="cloud-upload-outline" size={22} color={Colors.heritageGreen} />
          </View>
          <Text style={styles.optionLabel}>Upload</Text>
        </Pressable>
      </View>

      {/* Change Prompt */}
      <Pressable style={styles.changePrompt} onPress={onChangePrompt}>
        <Ionicons name="shuffle-outline" size={16} color={Colors.heritageGreen} />
        <Text style={styles.changePromptText}>Try a different prompt</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.charcoalInk,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.heirloomGold,
  },
  label: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: Colors.heirloomGold,
    letterSpacing: 1.2,
  },
  category: {
    fontSize: Typography.sizes.xs,
    color: Colors.charcoalInk + '60',
    textTransform: 'capitalize',
  },
  promptText: {
    fontSize: Typography.sizes['2xl'],
    color: Colors.charcoalInk,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 28,
    fontWeight: '400',
  },
  recordContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pulse: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.heirloomGold,
  },
  recordButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.heirloomGold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.heirloomGold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  recordLabel: {
    marginTop: 12,
    fontSize: Typography.sizes.sm,
    fontWeight: '500',
    color: Colors.charcoalInk,
  },
  options: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 28,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.heritageGreen + '10',
    width: '100%',
    justifyContent: 'center',
  },
  option: {
    alignItems: 'center',
    gap: 8,
  },
  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.ivoryLinen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.charcoalInk + '80',
    fontWeight: '500',
  },
  changePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  changePromptText: {
    fontSize: Typography.sizes.sm,
    color: Colors.heritageGreen,
    fontWeight: '500',
  },
});
