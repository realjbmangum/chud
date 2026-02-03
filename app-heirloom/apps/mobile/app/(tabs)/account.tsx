import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Colors, Typography } from '@/constants';

const MENU_SECTIONS = [
  {
    title: 'Account',
    items: [
      { icon: 'person-outline', label: 'Edit Profile', href: '/profile' },
      { icon: 'notifications-outline', label: 'Notifications', href: '/notifications' },
      { icon: 'card-outline', label: 'Subscription', href: '/subscription', badge: 'Free' },
    ],
  },
  {
    title: 'Privacy & Security',
    items: [
      { icon: 'shield-checkmark-outline', label: 'Privacy Settings', href: '/privacy' },
      { icon: 'key-outline', label: 'Change Password', href: '/password' },
      { icon: 'finger-print-outline', label: 'Biometric Login', href: '/biometric', toggle: true },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help-circle-outline', label: 'Help & FAQ', href: '/help' },
      { icon: 'chatbubble-outline', label: 'Contact Us', href: '/contact' },
      { icon: 'star-outline', label: 'Rate the App', href: '/rate' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { icon: 'document-text-outline', label: 'Terms of Service', href: '/terms' },
      { icon: 'lock-closed-outline', label: 'Privacy Policy', href: '/privacy-policy' },
    ],
  },
];

export default function AccountScreen() {
  const handleMenuPress = (item: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigation would go here
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Section */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.profileSection}>
        <LinearGradient
          colors={[Colors.heritageGreen, '#0A2E24']}
          style={styles.profileGradient}
        />
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JM</Text>
          </View>
          <Pressable style={styles.editAvatarButton}>
            <Ionicons name="camera" size={14} color={Colors.white} />
          </Pressable>
        </View>
        <Text style={styles.name}>John McCullough</Text>
        <Text style={styles.email}>john@example.com</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Stories</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>Family</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>Capsules</Text>
          </View>
        </View>
      </Animated.View>

      {/* Menu Sections */}
      {MENU_SECTIONS.map((section, sectionIndex) => (
        <Animated.View
          key={section.title}
          entering={FadeInUp.duration(400).delay(100 + sectionIndex * 80)}
          style={styles.menuSection}
        >
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.menuCard}>
            {section.items.map((item, index) => (
              <Pressable
                key={item.label}
                style={[
                  styles.menuItem,
                  index < section.items.length - 1 && styles.menuItemBorder,
                ]}
                onPress={() => handleMenuPress(item)}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={Colors.heritageGreen}
                  />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                {item.toggle ? (
                  <View style={styles.toggle}>
                    <View style={styles.toggleKnob} />
                  </View>
                ) : (
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={Colors.charcoalInk + '30'}
                  />
                )}
              </Pressable>
            ))}
          </View>
        </Animated.View>
      ))}

      {/* Sign Out */}
      <Animated.View
        entering={FadeInUp.duration(400).delay(500)}
        style={styles.signOutSection}
      >
        <Pressable style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </Animated.View>

      {/* Version */}
      <Text style={styles.version}>Heirloom v1.0.0</Text>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ivoryLinen,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  profileGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.heirloomGold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: Colors.white,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.heritageGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  name: {
    fontSize: Typography.sizes.xl,
    fontWeight: '600',
    color: Colors.ivoryLinen,
    marginBottom: 4,
  },
  email: {
    fontSize: Typography.sizes.sm,
    color: Colors.ivoryLinen + 'AA',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: '700',
    color: Colors.heirloomGold,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.ivoryLinen + '99',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  menuSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: Colors.charcoalInk + '60',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.charcoalInk,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.heritageGreen + '08',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.heritageGreen + '08',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.charcoalInk,
  },
  badge: {
    backgroundColor: Colors.heirloomGold + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  badgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: Colors.heirloomGold,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.heritageGreen,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  signOutSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.error + '10',
    paddingVertical: 16,
    borderRadius: 12,
  },
  signOutText: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
    color: Colors.error,
  },
  version: {
    textAlign: 'center',
    paddingVertical: 24,
    fontSize: Typography.sizes.sm,
    color: Colors.charcoalInk + '40',
  },
});
