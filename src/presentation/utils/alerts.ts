import { Alert } from "react-native";

export const validationTitle = "Controlla i dati";

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Si e verificato un errore imprevisto.";

export const showValidationAlert = (error: unknown) => {
  Alert.alert(validationTitle, errorMessage(error));
};
