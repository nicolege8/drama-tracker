import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../lib/auth";

export default function AuthLayout() {
  const { session } = useAuth();

  if (session) {
    return <Redirect href="/(tabs)/browse" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
