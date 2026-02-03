import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.heritageGreen,
          },
          headerTintColor: Colors.ivoryLinen,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: Colors.ivoryLinen,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen
          name="record"
          options={{
            title: 'Record',
            presentation: 'modal',
          }}
        />
      </Stack>
    </>
  );
}
