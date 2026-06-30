import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView } from "react-native";

import { useNavigation } from "@react-navigation/native";

import { bookService } from "../../shared/services/bookservice";
import { IBookResponse } from "../../shared/interfaces";

import { BookCard, SearchBar } from "../../shared/components";
import { styles } from "./styles";
import { AppNavigation } from "../../routes/types";
import { Header } from "../../shared/components/header/header";

export function Home() {
  const navigation = useNavigation<AppNavigation>();

  const [search, setSearch] = useState("");

  const [books, setBooks] = useState<IBookResponse[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      bookService.search(search).then((response) => {
        if (!(response instanceof Error)) {
          setBooks(response);
        }

        setLoading(false);
      });
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header search={search} setSearch={setSearch} />

      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookCard
            book={item}
            onPress={() => navigation.navigate("BookDetail", { id: item.id })}
          />
        )}
      />
    </SafeAreaView>
  );
}
