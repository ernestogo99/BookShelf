import { Image, Pressable, ScrollView, Text, View } from "react-native";

import { IBookResponse } from "../../../shared/interfaces";
import { Label } from "../label/label";
import { styles } from "./styles";

interface Props {
  book: IBookResponse;
  onPress(): void;
}

export function BookCard({ book, onPress }: Props) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Text style={styles.title}>{book.title}</Text>

      <Text style={styles.author}>{book.authors.join(", ")}</Text>

      <View style={styles.body}>
        <Image
          source={{
            uri: book.cover_url,
          }}
          style={styles.cover}
        />

        <View style={styles.info}>
          <Text style={styles.synopsis} numberOfLines={6}>
            {book.synopsis}
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {book.genres?.map((genre) => (
              <Label key={genre} text={genre} />
            ))}
          </ScrollView>
        </View>
      </View>
    </Pressable>
  );
}
