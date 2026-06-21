import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Switch,
  Image,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import {
  toggleAutoSync,
  toggleWifiOnly,
  clearCompleted,
  resetQueueStatus,
  removeFromQueue,
  QueueItem,
} from '../../../services/redux/queue/queueSlice';
import { signOutSuccess } from '../../../services/redux/users/userSlice';
import { googleAuthService } from '../../../services/api/gdrive';
import { triggerSync } from '../../../services/api/syncManager';
import { colors } from '../../../theme/color';
import { showToast } from '../../../utility/toast';
import {
  Cloud,
  CloudLightning,
  CloudOff,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Trash2,
  Image as ImageIcon,
  Video,
  LogOut,
  Settings,
  ListTodo,
} from 'lucide-react-native';

export const GalleryScreen = () => {
  const dispatch = useAppDispatch();
  
  // Redux State
  const { user } = useAppSelector((state) => state.users);
  const { items, wifiOnly, autoSync } = useAppSelector((state) => state.queue);

  // Compute stats
  const totalCount = items.length;
  const pendingCount = items.filter((i) => i.status === 'pending' || i.status === 'uploading').length;
  const syncedCount = items.filter((i) => i.status === 'synced').length;
  const failedCount = items.filter((i) => i.status === 'failed').length;

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out from Visora?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await googleAuthService.signOut();
            dispatch(signOutSuccess());
            showToast('Signed out successfully');
          } catch (err) {
            console.error('[Gallery] Sign out failed:', err);
            showToast('Failed to sign out');
          }
        },
      },
    ]);
  };

  const handleRetryItem = (id: string) => {
    dispatch(resetQueueStatus(id));
    showToast('Retrying upload...');
    triggerSync();
  };

  const handleRetryAllFailed = () => {
    const failedItems = items.filter((i) => i.status === 'failed');
    if (failedItems.length === 0) {
      showToast('No failed uploads to retry');
      return;
    }
    failedItems.forEach((item) => {
      dispatch(resetQueueStatus(item.id));
    });
    showToast('Retrying all failed uploads...');
    triggerSync();
  };

  const handleManualSyncAll = () => {
    const pendingItems = items.filter((i) => i.status === 'pending');
    if (pendingItems.length === 0) {
      showToast('No pending items to sync');
      return;
    }
    showToast('Starting manual synchronization...');
    triggerSync();
  };

  const handleDeleteItem = (id: string) => {
    dispatch(removeFromQueue(id));
    showToast('Item removed from queue');
  };

  const renderQueueItem = ({ item }: { item: QueueItem }) => {
    const formattedDate = new Date(item.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.queueItem}>
        <View style={styles.itemIconContainer}>
          {item.type === 'photo' ? (
            <ImageIcon size={22} color={colors.secondary} />
          ) : (
            <Video size={22} color="#EF4444" />
          )}
        </View>

        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.itemSubText}>
            {item.type.toUpperCase()} • {formattedDate}
          </Text>

          {item.status === 'uploading' && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
            </View>
          )}

          {item.status === 'failed' && item.error && (
            <Text style={styles.itemErrorText} numberOfLines={1}>
              Error: {item.error}
            </Text>
          )}
        </View>

        <View style={styles.itemActions}>
          {item.status === 'synced' && (
            <CheckCircle2 size={20} color={colors.success} style={styles.statusIcon} />
          )}

          {item.status === 'failed' && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => handleRetryItem(item.id)} style={styles.itemActionButton}>
                <RotateCw size={18} color={colors.secondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteItem(item.id)} style={styles.itemActionButton}>
                <Trash2 size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}

          {item.status === 'pending' && (
            <CloudOff size={20} color="#8E8E93" style={styles.statusIcon} />
          )}

          {item.status === 'uploading' && (
            <Text style={styles.progressText}>{item.progress}%</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0B0C" />

      {/* Header Profile Section */}
      <View style={styles.profileHeader}>
        <View style={styles.profileInfo}>
          {user?.photo ? (
            <Image source={{ uri: user.photo }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarLetter}>
                {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.nameContainer}>
            <Text style={styles.userName}>{user?.name || 'Visora User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <LogOut size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Sync Statistics Dashboard */}
      <View style={styles.statsCard}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalCount}</Text>
          <Text style={styles.statLabel}>Captured</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: colors.secondary }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: colors.success }]}>{syncedCount}</Text>
          <Text style={styles.statLabel}>Synced</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>{failedCount}</Text>
          <Text style={styles.statLabel}>Failed</Text>
        </View>
      </View>

      {/* Settings Panel */}
      <View style={styles.settingsSection}>
        <View style={styles.sectionHeader}>
          <Settings size={16} color={colors.primary} />
          <Text style={styles.sectionTitle}>Sync Settings</Text>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Auto-Sync on Capture</Text>
          <Switch
            value={autoSync}
            onValueChange={() => dispatch(toggleAutoSync())}
            trackColor={{ false: '#27272A', true: colors.primary }}
            thumbColor="#F4F4F5"
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Sync over Wi-Fi Only</Text>
          <Switch
            value={wifiOnly}
            onValueChange={() => dispatch(toggleWifiOnly())}
            trackColor={{ false: '#27272A', true: colors.primary }}
            thumbColor="#F4F4F5"
          />
        </View>
      </View>

      {/* Queue Section */}
      <View style={styles.queueHeaderRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ListTodo size={18} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={styles.queueTitle}>Upload Sync Queue</Text>
        </View>

        <View style={styles.queueActionsRow}>
          {failedCount > 0 && (
            <TouchableOpacity onPress={handleRetryAllFailed} style={styles.headerActionButton}>
              <RotateCw size={14} color={colors.secondary} />
              <Text style={[styles.headerActionButtonText, { color: colors.secondary }]}>Retry Failed</Text>
            </TouchableOpacity>
          )}

          {syncedCount > 0 && (
            <TouchableOpacity onPress={() => dispatch(clearCompleted())} style={styles.headerActionButton}>
              <Trash2 size={14} color="#EF4444" />
              <Text style={[styles.headerActionButtonText, { color: '#EF4444' }]}>Clear Done</Text>
            </TouchableOpacity>
          )}

          {!autoSync && pendingCount > 0 && (
            <TouchableOpacity onPress={handleManualSyncAll} style={styles.headerActionButton}>
              <Cloud size={14} color={colors.success} />
              <Text style={[styles.headerActionButtonText, { color: colors.success }]}>Sync Now</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <CloudLightning size={48} color="#27272A" style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>Your queue is empty</Text>
          <Text style={styles.emptySub}>Capture photos or videos inside the Camera tab to start uploading.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderQueueItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  nameContainer: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statsCard: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  settingsSection: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  queueHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  queueTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  queueActionsRow: {
    flexDirection: 'row',
  },
  headerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  headerActionButtonText: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  itemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  itemSubText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    height: 4,
    width: '100%',
    backgroundColor: '#27272A',
    borderRadius: 2,
    marginTop: 6,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  itemErrorText: {
    color: '#EF4444',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  itemActions: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  statusIcon: {
    marginRight: 4,
  },
  itemActionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});

export default GalleryScreen;
