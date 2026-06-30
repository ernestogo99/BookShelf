import { StyleSheet } from "react-native";
import { colors } from "../../theme";

export const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#BDBDBD",
  },

  title: {
    fontWeight: "700",
    fontSize: 22,
    marginBottom: 2,
  },

  author: {
    color: colors.gray,
    marginBottom: 12,
  },

  body: {
    flexDirection: "row",
  },

  cover: {
    width: 90,
    height: 130,
    borderRadius: 6,
    marginRight: 14,
  },

  info: {
    flex: 1,
  },

  synopsis: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
  },
});
