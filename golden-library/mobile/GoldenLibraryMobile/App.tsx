import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface Book {
  _id: string;
  title: string;
  author: string;
  coverImageURL: string;
  type: 'novel' | 'ebook' | 'comic' | 'manga';
  tags: string[];
}

interface User {
  id: string;
  email: string;
  username: string;
}

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [books, setBooks] = useState<Book[]>([]);
  const [savedBooks, setSavedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  // Auth states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsLoggedIn(true);
        fetchBooks();
        fetchSavedBooks();
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://10.0.2.2:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setIsLoggedIn(true);
        fetchBooks();
        fetchSavedBooks();
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !username) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://10.0.2.2:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setIsLoggedIn(true);
        fetchBooks();
        fetchSavedBooks();
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
    setCurrentScreen('home');
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch('http://10.0.2.2:5000/api/content');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchSavedBooks = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://10.0.2.2:5000/api/user/saved', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSavedBooks(data);
      }
    } catch (error) {
      console.error('Error fetching saved books:', error);
    }
  };

  const saveBook = async (bookId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://10.0.2.2:5000/api/user/saved/${bookId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchSavedBooks();
        Alert.alert('Success', 'Book saved to your list!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save book');
    }
  };

  const removeSavedBook = async (bookId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://10.0.2.2:5000/api/user/saved/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchSavedBooks();
        Alert.alert('Success', 'Book removed from your list!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to remove book');
    }
  };

  const renderBook = ({ item }: { item: Book }) => (
    <View style={styles.bookCard}>
      <Image source={{ uri: item.coverImageURL }} style={styles.bookCover} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>by {item.author}</Text>
        <View style={styles.bookTypeContainer}>
          <Text style={styles.bookType}>{item.type}</Text>
        </View>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => saveBook(item._id)}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSavedBook = ({ item }: { item: Book }) => (
    <View style={styles.bookCard}>
      <Image source={{ uri: item.coverImageURL }} style={styles.bookCover} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>by {item.author}</Text>
        <View style={styles.bookTypeContainer}>
          <Text style={styles.bookType}>{item.type}</Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeSavedBook(item._id)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAuthScreen = () => (
    <View style={styles.authContainer}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>The Golden Library</Text>
        <Text style={styles.logoSubtext}>Your premium digital book collection</Text>
      </View>

      <View style={styles.authForm}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, isLogin && styles.activeTab]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, !isLogin && styles.activeTab]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Register</Text>
          </TouchableOpacity>
        </View>

        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#888"
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#888"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#888"
        />

        <TouchableOpacity
          style={styles.authButton}
          onPress={isLogin ? handleLogin : handleRegister}
          disabled={loading}
        >
          <Text style={styles.authButtonText}>
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHomeScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back, {user?.username}!</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Featured Books</Text>
      <FlatList
        data={books.slice(0, 10)}
        renderItem={renderBook}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.booksList}
      />

      <Text style={styles.sectionTitle}>All Books</Text>
      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.booksGrid}
      />
    </ScrollView>
  );

  const renderSavedScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Your Saved Books</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {savedBooks.length > 0 ? (
        <FlatList
          data={savedBooks}
          renderItem={renderSavedBook}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.booksGrid}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No saved books yet</Text>
          <Text style={styles.emptyStateSubtext}>Start exploring and save books you'd like to read!</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderBottomNavigation = () => (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={[styles.navItem, currentScreen === 'home' && styles.activeNavItem]}
        onPress={() => setCurrentScreen('home')}
      >
        <Text style={[styles.navText, currentScreen === 'home' && styles.activeNavText]}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.navItem, currentScreen === 'saved' && styles.activeNavItem]}
        onPress={() => setCurrentScreen('saved')}
      >
        <Text style={[styles.navText, currentScreen === 'saved' && styles.activeNavText]}>Saved</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#111111" />
        {renderAuthScreen()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />
      {currentScreen === 'home' && renderHomeScreen()}
      {currentScreen === 'saved' && renderSavedScreen()}
      {renderBottomNavigation()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  logoSubtext: {
    fontSize: 16,
    color: '#888',
  },
  authForm: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFD700',
  },
  tabText: {
    color: '#888',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#111111',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#fff',
    fontSize: 16,
  },
  authButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  authButtonText: {
    color: '#111111',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: '600',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#444',
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 20,
    marginBottom: 16,
  },
  booksList: {
    paddingLeft: 20,
  },
  booksGrid: {
    padding: 20,
  },
  bookCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    margin: 8,
    width: (width - 60) / 2,
    overflow: 'hidden',
  },
  bookCover: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  bookInfo: {
    padding: 12,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  bookTypeContainer: {
    marginBottom: 8,
  },
  bookType: {
    fontSize: 10,
    color: '#FFD700',
    backgroundColor: '#FFD70020',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  saveButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#111111',
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#888',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  navItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeNavItem: {
    backgroundColor: '#FFD70020',
  },
  navText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  activeNavText: {
    color: '#FFD700',
  },
});

export default App;