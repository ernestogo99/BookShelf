import { StyleSheet } from "react-native";
import { colors } from "../../theme";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dangerDark,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",

    height: 44,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: colors.white,
  },
});
