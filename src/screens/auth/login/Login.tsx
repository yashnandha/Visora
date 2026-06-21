import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StatusBar, SafeAreaView } from 'react-native';
import { styles } from './login.style';
import { LoginProps } from './loginProps';
import { useLogin } from './useLogin';
import { Chrome } from 'lucide-react-native';

export const Login: React.FC<LoginProps> = () => {
  const { isLoading, error, handleGoogleSignIn } = useLogin();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0B0C" />
      <View style={styles.glowContainer} />

      {/* Brand logo section */}
      <View style={styles.logoContainer}>
        <View style={styles.logoRing}>
          <View style={styles.logoCore}>
            <View style={styles.logoDot} />
          </View>
        </View>
        <Text style={styles.appName}>Visora</Text>
        <Text style={styles.appTagline}>Capture • Organize • Cloud Sync</Text>
      </View>

      {/* Feature highlight card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Event Media Hub</Text>
        
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>📸</Text>
          <Text style={styles.featureText}>
            Capture high-quality photos and video clips with advanced camera controls.
          </Text>
        </View>

        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>☁️</Text>
          <Text style={styles.featureText}>
            Automatically upload captured files directly to your secure Google Drive.
          </Text>
        </View>

        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>📁</Text>
          <Text style={styles.featureText}>
            Auto-organize your uploads using pre-defined event folder structures.
          </Text>
        </View>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Actions */}
      <TouchableOpacity
        style={styles.signInButton}
        onPress={handleGoogleSignIn}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#1F2937" size="small" />
        ) : (
          <>
            <Chrome size={22} color="#4285F4" />
            <Text style={styles.signInButtonText}>Sign in with Google</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={{ flex: 1 }} />
      <Text style={styles.footerText}>Version 1.0.0 • Visora for Teams</Text>
    </SafeAreaView>
  );
};

export default Login;
