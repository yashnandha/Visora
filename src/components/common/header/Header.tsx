import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './feature.style';
import { ComponentProps } from './featureProps';
import { useComponent } from './useComponent';

export const Component: React.FC<ComponentProps> = (props) => {
  const {} = useComponent(props);
  return (
    <View style={styles.container}>
      <Text>Component Component</Text>
    </View>
  );
};
