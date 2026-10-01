import { Stack } from "expo-router";
import { APP_COLORS } from "../constants/tokens";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: APP_COLORS.primary,
        },
        headerTintColor: APP_COLORS.onPrimary,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 17,
        },
        headerBackTitle: "Atrás",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Golden Starter V3",
        }}
      />
    </Stack>
  );
}
