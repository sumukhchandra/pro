import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';

const App = () => {
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    // placeholder: simulate reading locally stored downloads
    setDownloads([]);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reader</Text>
      <Text style={styles.subtitle}>My Downloads (Pro)</Text>
      {downloads.length === 0 ? (
        <Text style={{ color: 'gray' }}>No downloads yet.</Text>
      ) : (
        <FlatList
          data={downloads}
          keyExtractor={(item) => item.content._id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card}>
              <Image source={{ uri: item.content.coverImageURL }} style={styles.cover} />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.cardTitle}>{item.content.title}</Text>
                <Text style={{ color: '#555' }}>{item.content.contentType}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 80, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: 'gray', marginBottom: 20 },
  card: { flexDirection: 'row', padding: 12, marginBottom: 10, backgroundColor: '#fff', borderRadius: 8, width: '90%', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  cover: { width: 64, height: 96, borderRadius: 4 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
});

export default App;
