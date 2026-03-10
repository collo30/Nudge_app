import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Thin semantic wrapper around @capacitor/haptics.
 * All methods silently no-op on web/desktop — safe to call anywhere.
 */
const safe = (fn: () => Promise<void>) => {
    fn().catch(() => { /* no-op on web */ });
};

export function useHaptics() {
    return {
        /** Light tick — confirms a minor interaction (e.g. tapping a chip) */
        light: () => safe(() => Haptics.impact({ style: ImpactStyle.Light })),

        /** Medium bump — confirms a significant action (e.g. assigning a budget amount) */
        medium: () => safe(() => Haptics.impact({ style: ImpactStyle.Medium })),

        /** Heavy thud — marks a major milestone (e.g. category fully funded) */
        heavy: () => safe(() => Haptics.impact({ style: ImpactStyle.Heavy })),

        /** Success pattern — goal reached, transaction logged cleanly */
        success: () => safe(() => Haptics.notification({ type: NotificationType.Success })),

        /** Warning buzz — category overspent, budget exceeded */
        warning: () => safe(() => Haptics.notification({ type: NotificationType.Warning })),

        /** Error double-buzz — invalid input, destructive action */
        error: () => safe(() => Haptics.notification({ type: NotificationType.Error })),
    };
}
