import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import { useState, useEffect } from 'react';
import { Colors, Typography } from '@/constants';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function RecordScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const buttonScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.3);
  const waveAmplitude = useSharedValue(1);

  useEffect(() => {
    if (isRecording) {
      // Animate pulse while recording
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      waveAmplitude.value = withRepeat(
        withSequence(
          withTiming(1.5, { duration: 300 }),
          withTiming(0.8, { duration: 300 }),
          withTiming(1.2, { duration: 300 }),
          withTiming(0.9, { duration: 300 })
        ),
        -1,
        false
      );
    } else {
      pulseScale.value = withTiming(1);
      pulseOpacity.value = withTiming(0.3);
      waveAmplitude.value = withTiming(1);
    }
  }, [isRecording]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handleRecord = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsRecording(!isRecording);
    if (isRecording) {
      setSeconds(0);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.ivoryLinen, '#F5F2EB']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.cancelButton}>
          <Ionicons name="close" size={24} color={Colors.charcoalInk} />
        </Pressable>
        <View style={styles.recordingIndicator}>
          <View style={[styles.recordingDot, isRecording && styles.recordingDotActive]} />
          <Text style={styles.recordingText}>
            {isRecording ? 'Recording' : 'Ready'}
          </Text>
        </View>
        <Pressable style={styles.doneButton} disabled={!isRecording && seconds === 0}>
          <Text style={[styles.doneText, seconds > 0 && styles.doneTextActive]}>
            Done
          </Text>
        </Pressable>
      </Animated.View>

      {/* Timer */}
      <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.timerContainer}>
        <Text style={[styles.timer, isRecording && styles.timerActive]}>
          {formatTime(seconds)}
        </Text>
        <Text style={styles.timerLabel}>
          {isRecording ? 'Recording your story...' : 'Tap the button to start'}
        </Text>
      </Animated.View>

      {/* Prompt Reminder */}
      <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.promptReminder}>
        <View style={styles.promptHeader}>
          <View style={styles.promptDot} />
          <Text style={styles.promptReminderLabel}>YOUR PROMPT</Text>
        </View>
        <Text style={styles.promptReminderText}>
          What is your favorite childhood memory?
        </Text>
      </Animated.View>

      {/* Waveform */}
      <Animated.View entering={FadeIn.duration(400).delay(300)} style={styles.waveformContainer}>
        <View style={styles.waveformPlaceholder}>
          {Array.from({ length: 40 }).map((_, i) => {
            const baseHeight = 15 + Math.sin(i * 0.5) * 10 + Math.random() * 20;
            return (
              <View
                key={i}
                style={[
                  styles.waveformBar,
                  {
                    height: baseHeight,
                    backgroundColor: isRecording
                      ? Colors.heirloomGold
                      : Colors.heritageGreen + '25',
                  },
                ]}
              />
            );
          })}
        </View>
      </Animated.View>

      {/* Controls */}
      <Animated.View entering={FadeInUp.duration(400).delay(400)} style={styles.controls}>
        {/* Record Button */}
        <View style={styles.recordButtonContainer}>
          <Animated.View style={[styles.pulse, pulseStyle, isRecording && styles.pulseRecording]} />
          <AnimatedPressable
            style={[styles.recordButtonLarge, buttonStyle, isRecording && styles.recordButtonRecording]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleRecord}
          >
            {isRecording ? (
              <View style={styles.stopIcon} />
            ) : (
              <Ionicons name="mic" size={40} color={Colors.white} />
            )}
          </AnimatedPressable>
        </View>

        <Text style={styles.recordHint}>
          {isRecording ? 'Tap to stop' : 'Tap to Record'}
        </Text>

        {/* Mode Switcher */}
        <View style={styles.modeSwitcher}>
          <Pressable style={[styles.modeButton, styles.modeButtonActive]}>
            <Ionicons name="mic" size={20} color={Colors.ivoryLinen} />
            <Text style={styles.modeTextActive}>Audio</Text>
          </Pressable>
          <Pressable style={styles.modeButton}>
            <Ionicons name="videocam-outline" size={20} color={Colors.heritageGreen} />
            <Text style={styles.modeText}>Video</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ivoryLinen,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.charcoalInk,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: Colors.charcoalInk,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.charcoalInk + '30',
  },
  recordingDotActive: {
    backgroundColor: Colors.error,
  },
  recordingText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: Colors.charcoalInk,
  },
  doneButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  doneText: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.charcoalInk + '30',
  },
  doneTextActive: {
    color: Colors.heritageGreen,
  },
  timerContainer: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 20,
  },
  timer: {
    fontSize: 72,
    fontWeight: '300',
    color: Colors.charcoalInk,
    letterSpacing: -2,
  },
  timerActive: {
    color: Colors.heirloomGold,
  },
  timerLabel: {
    marginTop: 8,
    fontSize: Typography.sizes.sm,
    color: Colors.charcoalInk + '60',
  },
  promptReminder: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.charcoalInk,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  promptDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.heirloomGold,
  },
  promptReminderLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: Colors.heirloomGold,
    letterSpacing: 1,
  },
  promptReminderText: {
    fontSize: Typography.sizes.lg,
    color: Colors.charcoalInk,
    lineHeight: 26,
  },
  waveformContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  waveformPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 80,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
  },
  controls: {
    alignItems: 'center',
    paddingBottom: 48,
  },
  recordButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.heirloomGold,
  },
  pulseRecording: {
    backgroundColor: Colors.error,
  },
  recordButtonLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.heirloomGold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.heirloomGold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  recordButtonRecording: {
    backgroundColor: Colors.error,
    shadowColor: Colors.error,
  },
  stopIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.white,
  },
  recordHint: {
    marginTop: 16,
    fontSize: Typography.sizes.base,
    fontWeight: '500',
    color: Colors.charcoalInk,
  },
  modeSwitcher: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 28,
    backgroundColor: Colors.white,
    padding: 6,
    borderRadius: 12,
    shadowColor: Colors.charcoalInk,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: Colors.heritageGreen,
  },
  modeText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '500',
    color: Colors.heritageGreen,
  },
  modeTextActive: {
    color: Colors.ivoryLinen,
  },
});
