import { NativeBiometric, BiometryType } from 'capacitor-native-biometric';

export interface BiometricResult {
    isAvailable: boolean;
    biometryType: 'fingerprint' | 'face' | 'iris' | 'none';
    error?: string;
}

/**
 * Check if biometric authentication is available on the device
 */
export async function checkBiometricAvailability(): Promise<BiometricResult> {
    try {
        const result = await NativeBiometric.isAvailable();

        let biometryType: BiometricResult['biometryType'] = 'none';

        if (result.isAvailable) {
            switch (result.biometryType) {
                case BiometryType.FINGERPRINT:
                    biometryType = 'fingerprint';
                    break;
                case BiometryType.FACE_AUTHENTICATION:
                    biometryType = 'face';
                    break;
                case BiometryType.IRIS_AUTHENTICATION:
                    biometryType = 'iris';
                    break;
                default:
                    biometryType = 'fingerprint'; // Default to fingerprint
            }
        }

        return {
            isAvailable: result.isAvailable,
            biometryType
        };
    } catch (error) {
        console.log('Biometric check failed:', error);
        return {
            isAvailable: false,
            biometryType: 'none',
            error: String(error)
        };
    }
}

/**
 * Perform biometric authentication
 * @returns true if authentication succeeded, false otherwise
 */
export async function authenticateWithBiometric(): Promise<boolean> {
    try {
        // First check if available
        const availability = await checkBiometricAvailability();
        if (!availability.isAvailable) {
            console.log('Biometric not available');
            return false;
        }

        // Perform verification
        await NativeBiometric.verifyIdentity({
            title: 'Unlock Pocket Budget',
            subtitle: 'Use your fingerprint to unlock',
            description: 'Touch the fingerprint sensor',
            negativeButtonText: 'Use PIN',
            maxAttempts: 3
        });

        // If we get here, authentication succeeded
        return true;
    } catch (error) {
        // User cancelled or authentication failed
        console.log('Biometric auth failed:', error);
        return false;
    }
}
