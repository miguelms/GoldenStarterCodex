import { Stack } from "expo-router";
import { CLINICAL_COLORS } from "../constants/tokens";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: CLINICAL_COLORS.primaryTeal,
        },
        headerTintColor: CLINICAL_COLORS.onPrimary,
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
          title: "CareFlow HomeCare",
        }}
      />
      <Stack.Screen
        name="shift"
        options={{
          title: "Hoja de Trabajo Diaria",
        }}
      />
    </Stack>
  );
}
