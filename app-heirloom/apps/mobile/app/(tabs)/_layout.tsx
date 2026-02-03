import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.heritageGreen,
        tabBarInactiveTintColor: Colors.charcoalInk + '60',
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          borderTopColor: Colors.heritageGreen + '10',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 28,
          height: 84,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: Colors.white,
          shadowColor: Colors.charcoalInk,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        },
        headerTintColor: Colors.charcoalInk,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'Heirloom',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 20,
            color: Colors.heritageGreen,
          },
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: 'My Vault',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons
                name={focused ? 'folder' : 'folder-outline'}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: 'Family',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons
                name={focused ? 'people' : 'people-outline'}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconContainer: {
    backgroundColor: Colors.heritageGreen + '10',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
});
