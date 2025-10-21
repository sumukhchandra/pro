import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';

const GOLD = '#FFD700';
const BLACK = '#111111';

const App = () => {
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    setDownloads([]);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>The Golden Library</Text>
      <View style={styles.nav}>
        <Text style={styles.navLink}>Home</Text>
        <Text style={styles.navLink}>Novels</Text>
        <Text style={styles.navLink}>E-Books</Text>
        <Text style={styles.navLink}>Comics</Text>
        <Text style={styles.navLink}>Manga</Text>
        <Text style={[styles.navLink, styles.active]}>Saved</Text>
        <Text style={styles.navLink}>Community</Text>
      </View>

      <View style={{ width:'92%', marginTop: 12 }}>
        <Text style={styles.sectionTitle}>My Downloads (Pro)</Text>
        {downloads.length === 0 ? (
          <Text style={{ color: GOLD }}>No downloads yet.</Text>
        ) : (
          <FlatList
            data={downloads}
            keyExtractor={(item) => item.content._id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card}>
                <Image source={{ uri: item.content.coverImageURL }} style={styles.cover} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.cardTitle}>{item.content.title}</Text>
                  <Text style={{ color: GOLD }}>{item.content.contentType}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <View style={styles.chatBox}>
        <Text style={styles.sectionTitle}>Community Chat</Text>
        <View style={styles.chatInputRow}>
          <TextInput style={styles.input} placeholder="Say hello…" placeholderTextColor="#888" />
          <TouchableOpacity style={styles.btn}><Text style={styles.btnText}>Send</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BLACK, alignItems: 'center', paddingTop: 48 },
  logo: { color: GOLD, fontSize: 22, fontWeight: '800', marginBottom: 12 },
  nav: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  navLink: { color: '#e6e6e6', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6 },
  active: { backgroundColor: GOLD, color: BLACK },
  sectionTitle: { color: GOLD, fontWeight: '700', fontSize: 18, marginBottom: 8 },
  card: { flexDirection: 'row', padding: 12, marginBottom: 10, backgroundColor: '#0f0f0f', borderColor: GOLD, borderWidth: 1, borderRadius: 10, width: '100%' },
  cover: { width: 64, height: 96, borderRadius: 4, backgroundColor: '#1a1a1a' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: GOLD },
  chatBox: { width: '92%', marginTop: 20 },
  chatInputRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: '#0b0b0b', borderColor: GOLD, borderWidth: 1, borderRadius: 8, color: '#fff', paddingHorizontal: 10, height: 42 },
  btn: { backgroundColor: GOLD, borderRadius: 8, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: BLACK, fontWeight: '700' },
});

export default App;
