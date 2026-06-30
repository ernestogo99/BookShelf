import { Text, View } from "react-native";

import { styles } from "./styles";

interface Props {
  text: string;
}

export function Label({ text }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}
