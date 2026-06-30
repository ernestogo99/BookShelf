import { StyleSheet } from "react-native";
import { colors } from "../../theme";

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray,
    marginRight: 8,
  },

  text: {
    fontSize: 11,
    color: colors.gray,
  },
});
