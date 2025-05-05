// services/utils/network.ts
import NetInfo from '@react-native-community/netinfo';

/**
 * Network utility functions to handle connectivity
 */

// Check if the device is currently connected to the internet
export const isConnected = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected === true;
};

// Subscribe to network status changes
export const subscribeToNetworkChanges = (
  onConnect: () => void,
  onDisconnect: () => void
): (() => void) => {
  return NetInfo.addEventListener(state => {
    if (state.isConnected) {
      onConnect();
    } else {
      onDisconnect();
    }
  });
};

// Add to package.json: "@react-native-community/netinfo": "^9.3.5"