import { SafeAreaView, View } from "react-native";
import { SearchBar } from "../searchbar/searchbar";
import { styles } from "./styles";

interface Props {
  search: string;
  setSearch(text: string): void;
}

export function Header({ search, setSearch }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <SearchBar value={search} onChangeText={setSearch} />
      </View>
    </SafeAreaView>
  );
}
