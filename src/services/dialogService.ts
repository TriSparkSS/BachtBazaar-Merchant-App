import { Alert, AlertButton } from 'react-native';

export type AppDialogButton = {
  text: string;
  onPress?: () => void;
  style?: AlertButton['style'];
};

export type AppDialogPayload = {
  title: string;
  message?: string;
  buttons?: AppDialogButton[];
};

type DialogHandler = (payload: AppDialogPayload) => void;

let dialogHandler: DialogHandler | null = null;

export const setAppDialogHandler = (handler: DialogHandler | null) => {
  dialogHandler = handler;
};

export const appAlert = (title: string, message?: string, buttons?: AppDialogButton[]) => {
  if (dialogHandler) {
    dialogHandler({
      title,
      message,
      buttons: buttons?.length ? buttons : [{ text: 'OK' }],
    });
    return;
  }

  appAlert(title, message, buttons);
};
