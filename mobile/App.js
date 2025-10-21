import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from 'react-query';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ContentListScreen from './src/screens/ContentListScreen';
import ContentReaderScreen from './src/screens/ContentReaderScreen';
import CreatorStudioScreen from './src/screens/CreatorStudioScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// Context
import { AuthProvider } from './src/contexts/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Novels') {
            iconName = 'book';
          } else if (route.name === 'Ebooks') {
            iconName = 'library-books';
          } else if (route.name === 'Comics') {
            iconName = 'photo-library';
          } else if (route.name === 'Mangas') {
            iconName = 'collections-bookmark';
          } else if (route.name === 'Community') {
            iconName = 'forum';
          } else if (route.name === 'Studio') {
            iconName = 'create';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Novels" component={() => <ContentListScreen type="novel" />} />
      <Tab.Screen name="Ebooks" component={() => <ContentListScreen type="ebook" />} />
      <Tab.Screen name="Comics" component={() => <ContentListScreen type="comic" />} />
      <Tab.Screen name="Mangas" component={() => <ContentListScreen type="manga" />} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Studio" component={CreatorStudioScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <AuthProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="ContentReader" component={ContentReaderScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
};

export default App;