import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './screen.style';
import { ScreenProps } from './screenProps';
import { useScreen } from './useScreen';

export const Screen: React.FC<ScreenProps> = (props) => {
  const {} = useScreen(props);
  return (
    <View style={styles.container}>
      <Text>Screen Screen</Text>
    </View>
  );
};
