import { GoogleSignin, User as GoogleUser } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In
// Note: In production, user must supply their webClientId (and iosClientId for iOS)
GoogleSignin.configure({
  scopes: ['https://www.googleapis.com/auth/drive.file'],
  offlineAccess: true,
});

export const googleAuthService = {
  signIn: async (): Promise<{ user: GoogleUser; accessToken: string }> => {
    try {
      await GoogleSignin.hasPlayServices();
      const user = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      return { user, accessToken: tokens.accessToken };
    } catch (error) {
      console.error('[Google Auth] Sign in error:', error);
      throw error;
    }
  },

  signOut: async (): Promise<void> => {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('[Google Auth] Sign out error:', error);
      throw error;
    }
  },

  getCurrentUser: async (): Promise<GoogleUser | null> => {
    try {
      return await GoogleSignin.getCurrentUser();
    } catch {
      return null;
    }
  },

  getAccessToken: async (): Promise<string> => {
    try {
      const tokens = await GoogleSignin.getTokens();
      return tokens.accessToken;
    } catch (error) {
      console.error('[Google Auth] Token refresh error:', error);
      throw error;
    }
  },

  isSignedIn: async (): Promise<boolean> => {
    return await GoogleSignin.isSignedIn();
  }
};

export const gdriveService = {
  /**
   * Search for a folder named "Visora_Captures" in Google Drive.
   * If it doesn't exist, create it.
   */
  getOrCreateFolder: async (accessToken: string): Promise<string> => {
    const folderName = 'Visora_Captures';
    const query = encodeURIComponent(`name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
    
    // Search request
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id)`;
    const searchResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      throw new Error(`Google Drive folder search failed: ${errorText}`);
    }

    const searchData = await searchResponse.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }

    // Not found, create the folder
    console.log('[Google Drive] Folder not found. Creating a new one...');
    const createUrl = 'https://www.googleapis.com/drive/v3/files';
    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Google Drive folder creation failed: ${errorText}`);
    }

    const folderData = await createResponse.json();
    return folderData.id;
  },

  /**
   * Upload file to Google Drive using a two-step flow.
   * 1. Create file metadata with parent folder reference.
   * 2. Upload file content binary as a Blob.
   */
  uploadFile: async (
    localUri: string,
    fileName: string,
    mimeType: string,
    accessToken: string,
    folderId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    try {
      console.log(`[Google Drive] Creating metadata for ${fileName}...`);
      
      // Step 1: Create metadata
      const metaUrl = 'https://www.googleapis.com/drive/v3/files';
      const metaResponse = await fetch(metaUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fileName,
          parents: [folderId],
        }),
      });

      if (!metaResponse.ok) {
        const errorText = await metaResponse.text();
        throw new Error(`Create metadata failed: ${errorText}`);
      }

      const fileMetadata = await metaResponse.json();
      const fileId = fileMetadata.id;
      console.log(`[Google Drive] Created file placeholder: ${fileId}. Uploading content...`);

      // Step 2: Upload content using react-native fetch and Blob
      // Read file into Blob natively in React Native
      const localFileResponse = await fetch(localUri);
      const blob = await localFileResponse.blob();

      // Trigger progress indication if onProgress callback is provided
      if (onProgress) {
        onProgress(50); // Simulating initial buffer loaded
      }

      const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': mimeType,
        },
        body: blob,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Content upload failed: ${errorText}`);
      }

      if (onProgress) {
        onProgress(100);
      }

      console.log(`[Google Drive] Sync completed for file: ${fileId}`);
      return fileId;
    } catch (error) {
      console.error(`[Google Drive] Upload error for ${fileName}:`, error);
      throw error;
    }
  }
};
