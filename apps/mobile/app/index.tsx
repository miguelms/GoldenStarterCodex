import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { APP_COLORS, APP_SPACING, APP_RADII } from "../constants/tokens";
import { OfflineBanner } from "../components/OfflineBanner";

export default function HomeScreen() {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setPendingCount(0);
      setIsSyncing(false);
    }, 1200);
  };

  const toggleConnection = () => {
    setIsOffline((prev) => !prev);
    if (!isOffline) {
      setPendingCount((c) => c + 1);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Offline State Banner */}
        <OfflineBanner
          isOffline={isOffline}
          pendingCount={pendingCount}
          isSyncing={isSyncing}
          onSync={handleSync}
          onToggleConnection={toggleConnection}
        />

        {/* Header Card */}
        <View style={styles.headerCard}>
          <Text style={styles.badgeText}>GOLDEN STARTER V2</Text>
          <Text style={styles.brandTitle}>Mobile Core Skeleton</Text>
          <Text style={styles.brandSubtitle}>
            Expo SDK 57 + React Native 0.86 + Hermes + Offline Outbox Sync
          </Text>
        </View>

        {/* System Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeaderRow}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, isOffline && styles.statusDotOffline]} />
              <Text style={styles.statusText}>{isOffline ? "Modo Offline" : "Conectado al API"}</Text>
            </View>
            <Text style={styles.versionText}>v2.0.0</Text>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>Zod</Text>
              <Text style={styles.metricLabel}>Shared Contracts</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>SQLite</Text>
              <Text style={styles.metricLabel}>Local Outbox</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>Auth</Text>
              <Text style={styles.metricLabel}>Better-Auth</Text>
            </View>
          </View>
        </View>

        {/* Simulation Controls */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Pruebas de Conectividad</Text>
          <TouchableOpacity
            style={[styles.actionBtn, isOffline ? styles.btnConnect : styles.btnDisconnect]}
            onPress={toggleConnection}
          >
            <Text style={styles.btnText}>
              {isOffline ? "Simular Conexión Online" : "Simular Pérdida de Red (Offline)"}
            </Text>
          </TouchableOpacity>

          {isOffline && (
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => setPendingCount((c) => c + 1)}
            >
              <Text style={styles.btnSecondaryText}>+ Encolar Evento de Prueba</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  scrollContent: {
    padding: APP_SPACING.lg,
  },
  headerCard: {
    backgroundColor: APP_COLORS.slateDark,
    borderRadius: APP_RADII.lg,
    padding: APP_SPACING.lg,
    marginBottom: APP_SPACING.md,
  },
  badgeText: {
    color: APP_COLORS.primaryContainer,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: APP_SPACING.xs,
  },
  brandTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: APP_SPACING.xs,
  },
  brandSubtitle: {
    color: APP_COLORS.borderSlate,
    fontSize: 13,
    lineHeight: 18,
  },
  statusCard: {
    backgroundColor: APP_COLORS.surfaceCard,
    borderRadius: APP_RADII.lg,
    borderWidth: 1,
    borderColor: APP_COLORS.borderLight,
    padding: APP_SPACING.lg,
    marginBottom: APP_SPACING.md,
  },
  statusHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: APP_SPACING.md,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: APP_COLORS.successGreen,
    marginRight: APP_SPACING.sm,
  },
  statusDotOffline: {
    backgroundColor: APP_COLORS.warningAmber,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: APP_COLORS.textPrimary,
  },
  versionText: {
    fontSize: 12,
    color: APP_COLORS.textMuted,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.borderLight,
    paddingTop: APP_SPACING.md,
  },
  metricItem: {
    alignItems: "center",
  },
  metricValue: {
    fontSize: 15,
    fontWeight: "700",
    color: APP_COLORS.primary,
  },
  metricLabel: {
    fontSize: 12,
    color: APP_COLORS.textSecondary,
    marginTop: 2,
  },
  actionsCard: {
    backgroundColor: APP_COLORS.surfaceCard,
    borderRadius: APP_RADII.lg,
    borderWidth: 1,
    borderColor: APP_COLORS.borderLight,
    padding: APP_SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: APP_COLORS.textPrimary,
    marginBottom: APP_SPACING.md,
  },
  actionBtn: {
    paddingVertical: APP_SPACING.md,
    borderRadius: APP_RADII.md,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisconnect: {
    backgroundColor: APP_COLORS.alertRed,
  },
  btnConnect: {
    backgroundColor: APP_COLORS.successGreen,
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  btnSecondary: {
    marginTop: APP_SPACING.sm,
    paddingVertical: APP_SPACING.sm,
    borderRadius: APP_RADII.md,
    borderWidth: 1,
    borderColor: APP_COLORS.borderSlate,
    alignItems: "center",
  },
  btnSecondaryText: {
    color: APP_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "500",
  },
});
