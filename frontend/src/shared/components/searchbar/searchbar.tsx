import { TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
import { colors } from "../../theme";

interface Props {
  value: string;
  onChangeText(text: string): void;
}

export function SearchBar({ value, onChangeText }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search for a title or a label"
        style={styles.input}
      />

      <Ionicons name="search" size={22} color={colors.black} />
    </View>
  );
}
