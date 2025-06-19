import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { theme } from '../../config/colors';

const Button = ({ title, onPress, style, textStyle }) => {
  return (
    <TouchableOpacity 
      style={[theme.button, style]} 
      onPress={onPress}
    >
      <Text style={[theme.buttonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;