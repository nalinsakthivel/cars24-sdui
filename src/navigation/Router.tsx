import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { navigationRef } from './RootNavigation';
import { RootStackParamList } from './NavigationParamList';
import HomeSDUIScreen from '../features/home/Screen';
import HomeStaticScreen from '../features/static/Screen';
import { RouteEnum } from '../enums/RouteEnum';

const Stack = createStackNavigator<RootStackParamList>();

const Router: React.FC = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={RouteEnum.HomeSDUI} component={HomeSDUIScreen} />
        <Stack.Screen name={RouteEnum.HomeStatic} component={HomeStaticScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Router;
