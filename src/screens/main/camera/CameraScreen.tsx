import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useMicrophonePermission,
} from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { addToQueue } from '../../../services/redux/queue/queueSlice';
import { triggerSync } from '../../../services/api/syncManager';
import { colors } from '../../../theme/color';
import { showToast } from '../../../utility/toast';
import * as RNFS from 'react-native-fs';
import {
  Zap,
  ZapOff,
  RefreshCw,
  Video,
  Camera as CameraIcon,
  ShieldAlert,
  Loader,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const CameraScreen = () => {
  const dispatch = useAppDispatch();
  const { autoSync } = useAppSelector((state) => state.queue);
  const isFocused = useIsFocused();
  const cameraRef = useRef<Camera>(null);

  // Camera permissions
  const { hasPermission: hasCamPermission, requestPermission: requestCamPermission } = useCameraPermission();
  const { hasPermission: hasMicPermission, requestPermission: requestMicPermission } = useMicrophonePermission();

  // State
  const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>('back');
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off');
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);

  const device = useCameraDevice(cameraPosition);

  // Record timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const handleGrantPermissions = async () => {
    const camStatus = await requestCamPermission();
    const micStatus = await requestMicPermission();
    if (!camStatus) {
      showToast('Camera permission is required to use this feature.');
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    if (mode === 'photo') {
      try {
        setIsCapturing(true);
        console.log('[Camera] Taking photo...');
        const photo = await cameraRef.current.takePhoto({
          flash: flash === 'auto' ? 'auto' : flash === 'on' ? 'on' : 'off',
        });

        const fileName = `visora_img_${Date.now()}.jpg`;
        const permanentPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        
        // Move photo from cache folder to permanent Documents folder
        await RNFS.moveFile(photo.path, permanentPath);
        
        console.log('[Camera] Saved photo to permanent storage:', permanentPath);
        
        dispatch(
          addToQueue({
            id: Date.now().toString(),
            uri: 'file://' + permanentPath,
            name: fileName,
            type: 'photo',
            size: 0, // default placeholder
            timestamp: Date.now(),
          })
        );
        
        showToast('Photo captured!');
        if (autoSync) {
          triggerSync();
        }
      } catch (error) {
        console.error('[Camera] Photo capture failed:', error);
        showToast('Failed to take photo');
      } finally {
        setIsCapturing(false);
      }
    } else {
      // Video Mode
      if (isRecording) {
        try {
          console.log('[Camera] Stopping video recording...');
          await cameraRef.current.stopRecording();
        } catch (error) {
          console.error('[Camera] Failed to stop recording:', error);
          showToast('Failed to save video');
          setIsRecording(false);
        }
      } else {
        // Start Video Recording
        try {
          // Request mic permission if not granted
          if (!hasMicPermission) {
            const micStatus = await requestMicPermission();
            if (!micStatus) {
              showToast('Microphone permission is required to record video.');
              return;
            }
          }

          setIsRecording(true);
          console.log('[Camera] Starting video recording...');
          
          await cameraRef.current.startRecording({
            flash: flash === 'on' ? 'on' : 'off',
            onRecordingFinished: async (video) => {
              console.log('[Camera] Recording finished:', video.path);
              const fileName = `visora_vid_${Date.now()}.mp4`;
              const permanentPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
              
              try {
                // Move video to permanent folder
                await RNFS.moveFile(video.path, permanentPath);
                
                dispatch(
                  addToQueue({
                    id: Date.now().toString(),
                    uri: 'file://' + permanentPath,
                    name: fileName,
                    type: 'video',
                    size: 0,
                    timestamp: Date.now(),
                  })
                );
                showToast('Video saved!');
                if (autoSync) {
                  triggerSync();
                }
              } catch (err) {
                console.error('[Camera] Moving video failed:', err);
                showToast('Failed to save video file.');
              }
              setIsRecording(false);
            },
            onRecordingError: (error) => {
              console.error('[Camera] Recording error:', error);
              showToast('Recording error occurred.');
              setIsRecording(false);
            },
          });
        } catch (error) {
          console.error('[Camera] Start recording failed:', error);
          showToast('Failed to start recording');
          setIsRecording(false);
        }
      }
    }
  };

  const toggleFlash = () => {
    setFlash((prev) => {
      if (prev === 'off') return 'on';
      if (prev === 'on') return 'auto';
      return 'off';
    });
  };

  const toggleCameraPosition = () => {
    setCameraPosition((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render Permission Gate Screen
  if (!hasCamPermission) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0B0B0C" />
        <View style={styles.permissionCard}>
          <ShieldAlert size={64} color={colors.primary} style={{ marginBottom: 16 }} />
          <Text style={styles.permissionTitle}>Camera Permissions Required</Text>
          <Text style={styles.permissionDescription}>
            Visora requires access to your camera and microphone to take photos and capture event video records.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={handleGrantPermissions}>
            <Text style={styles.permissionButtonText}>Grant Permissions</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Camera Viewport */}
      {device && isFocused ? (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isFocused}
          photo={true}
          video={true}
          audio={true}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Initializing Camera Device...</Text>
        </View>
      )}

      {/* Screen Capture Overlay */}
      {isCapturing && (
        <View style={styles.capturingOverlay}>
          <Loader size={48} color="#FFFFFF" style={styles.rotateSpinner} />
          <Text style={styles.capturingText}>Processing Capture...</Text>
        </View>
      )}

      {/* HUD Header Controls */}
      <SafeAreaView style={styles.hudHeader}>
        <View style={styles.hudControlsRow}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleFlash} disabled={isRecording}>
            {flash === 'on' ? (
              <Zap size={24} color="#FFD60A" />
            ) : flash === 'auto' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Zap size={20} color="#FFD60A" />
                <Text style={styles.subscriptText}>A</Text>
              </View>
            ) : (
              <ZapOff size={24} color="#8E8E93" />
            )}
          </TouchableOpacity>

          {isRecording && (
            <View style={styles.timerBadge}>
              <View style={styles.redDot} />
              <Text style={styles.timerText}>{formatTime(recordSeconds)}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.iconButton} onPress={toggleCameraPosition} disabled={isRecording}>
            <RefreshCw size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* HUD Footer Controls */}
      <View style={styles.hudFooter}>
        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'photo' && styles.modeButtonActive]}
            onPress={() => setMode('photo')}
            disabled={isRecording}
          >
            <CameraIcon size={16} color={mode === 'photo' ? '#FFFFFF' : '#8E8E93'} />
            <Text style={[styles.modeButtonText, mode === 'photo' && styles.modeButtonTextActive]}>PHOTO</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeButton, mode === 'video' && styles.modeButtonActive]}
            onPress={() => setMode('video')}
            disabled={isRecording}
          >
            <Video size={16} color={mode === 'video' ? '#FFFFFF' : '#8E8E93'} />
            <Text style={[styles.modeButtonText, mode === 'video' && styles.modeButtonTextActive]}>VIDEO</Text>
          </TouchableOpacity>
        </View>

        {/* Capture Buttons area */}
        <View style={styles.captureControlsRow}>
          {/* Left spacer for symmetry */}
          <View style={{ width: 48 }} />

          {/* Capture Trigger */}
          <TouchableOpacity
            onPress={handleCapture}
            style={[
              styles.captureButtonOuter,
              mode === 'video' && styles.captureButtonOuterVideo,
              isRecording && styles.captureButtonOuterRecording,
            ]}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.captureButtonInner,
                mode === 'video' && styles.captureButtonInnerVideo,
                isRecording && styles.captureButtonInnerRecording,
              ]}
            />
          </TouchableOpacity>

          {/* Right spacer */}
          <View style={{ width: 48 }} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F11',
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 12,
  },
  capturingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  capturingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  rotateSpinner: {
    // Rotating effect would be nice, but Lucide handles look great static too
  },
  hudHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  hudControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  subscriptText: {
    fontSize: 8,
    color: '#FFD60A',
    fontWeight: '900',
    marginLeft: 1,
    alignSelf: 'flex-start',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  timerText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  hudFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 16,
    alignItems: 'center',
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 1,
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  captureControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: width,
    paddingHorizontal: 40,
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  captureButtonOuterVideo: {
    borderColor: '#EF4444',
  },
  captureButtonOuterRecording: {
    borderColor: '#FFFFFF',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
  },
  captureButtonInnerVideo: {
    backgroundColor: '#EF4444',
  },
  captureButtonInnerRecording: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#EF4444',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default CameraScreen;
