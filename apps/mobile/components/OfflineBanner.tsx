import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { APP_COLORS, APP_SPACING, APP_RADII } from "../constants/tokens";

interface OfflineBannerProps {
  isOffline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  onSync: () => void;
  onToggleConnection: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOffline,
  pendingCount,
  isSyncing,
  onSync,
  onToggleConnection,
}) => {
  if (isOffline) {
    return (
      <View
        style={styles.offlineContainer}
        accessible={true}
        accessibilityRole="alert"
        accessibilityLabel={`Modo fuera de línea. ${pendingCount} registros pendientes.`}
      >
        <View style={styles.contentRow}>
          <Text style={styles.offlineIcon}>⚠️</Text>
          <View style={styles.textContainer}>
            <Text style={styles.offlineTitle}>Modo fuera de línea activo</Text>
            <Text style={styles.offlineSubtitle}>
              Los registros se guardan en SQLite local (${pendingCount} pendientes).
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.syncButton}
            onPress={onSync}
            disabled={isSyncing}
            accessibilityRole="button"
            accessibilityLabel="Reintentar sincronización con el servidor"
          >
            {isSyncing ? (
              <ActivityIndicator color={APP_COLORS.warningAmber} size="small" />
            ) : (
              <Text style={styles.syncButtonText}>🔄 Reintentar Sync</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleButton}
            onPress={onToggleConnection}
            accessibilityRole="button"
            accessibilityLabel="Conectar red"
          >
            <Text style={styles.toggleButtonText}>Conectar red</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      style={styles.onlineContainer}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel="Conectado y sincronizado con el servidor central"
    >
      <View style={styles.onlineStatusRow}>
        <View style={styles.onlineIndicatorDot} />
        <Text style={styles.onlineText}>
          En línea · Conectado al servidor{" "}
          {pendingCount > 0 ? `(${pendingCount} por enviar)` : "· Todo al día"}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.simulateOfflineBtn}
        onPress={onToggleConnection}
        accessibilityRole="button"
        accessibilityLabel="Simular modo sin conexión"
      >
        <Text style={styles.simulateOfflineText}>Simular Offline</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  offlineContainer: {
    backgroundColor: APP_COLORS.warningBg,
    borderColor: APP_COLORS.warningBorder,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: APP_COLORS.warningAmber,
    borderRadius: APP_RADII.md,
    padding: APP_SPACING.md,
    marginHorizontal: APP_SPACING.lg,
    marginTop: APP_SPACING.sm,
    marginBottom: APP_SPACING.md,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  offlineIcon: {
    fontSize: 20,
    marginRight: APP_SPACING.sm,
  },
  textContainer: {
    flex: 1,
  },
  offlineTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: APP_COLORS.warningAmber,
  },
  offlineSubtitle: {
    fontSize: 12,
    color: APP_COLORS.textSecondary,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: APP_SPACING.sm,
    gap: APP_SPACING.sm,
  },
  syncButton: {
    minHeight: APP_SPACING.minTouchTarget,
    paddingHorizontal: APP_SPACING.md,
    backgroundColor: APP_COLORS.surfaceCard,
    borderColor: APP_COLORS.warningBorder,
    borderWidth: 1,
    borderRadius: APP_RADII.md,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  syncButtonText: {
    color: APP_COLORS.warningAmber,
    fontSize: 13,
    fontWeight: "600",
  },
  toggleButton: {
    minHeight: APP_SPACING.minTouchTarget,
    paddingHorizontal: APP_SPACING.md,
    backgroundColor: APP_COLORS.surfaceCard,
    borderColor: APP_COLORS.borderSlate,
    borderWidth: 1,
    borderRadius: APP_RADII.md,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleButtonText: {
    color: APP_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  onlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: APP_COLORS.successBg,
    borderColor: APP_COLORS.successBorder,
    borderWidth: 1,
    borderRadius: APP_RADII.md,
    paddingHorizontal: APP_SPACING.md,
    paddingVertical: APP_SPACING.sm,
    marginHorizontal: APP_SPACING.lg,
    marginTop: APP_SPACING.sm,
    marginBottom: APP_SPACING.md,
    minHeight: 44,
  },
  onlineStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  onlineIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: APP_COLORS.successGreen,
    marginRight: APP_SPACING.sm,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: "600",
    color: APP_COLORS.successGreen,
  },
  simulateOfflineBtn: {
    minHeight: 36,
    paddingHorizontal: APP_SPACING.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  simulateOfflineText: {
    fontSize: 11,
    color: APP_COLORS.textMuted,
    textDecorationLine: "underline",
  },
});
