import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../helpers/styles';
import { AppDialogPayload, setAppDialogHandler } from '../services/dialogService';

const getDialogTone = (title: string) => {
  const value = title.toLowerCase();
  if (value.includes('success')) {
    return { icon: 'check-circle', accent: '#16A34A', bg: '#ECFDF3' };
  }
  if (value.includes('failed') || value.includes('invalid') || value.includes('error') || value.includes('missing')) {
    return { icon: 'alert-circle', accent: '#DC2626', bg: '#FEF2F2' };
  }
  if (value.includes('logout') || value.includes('hold on') || value.includes('confirm')) {
    return { icon: 'help-circle', accent: colors.orange, bg: '#FFF7ED' };
  }
  return { icon: 'information', accent: '#0EA5E9', bg: '#EFF6FF' };
};

const AppDialogProvider = ({ children }: PropsWithChildren) => {
  const [dialog, setDialog] = useState<AppDialogPayload | null>(null);

  useEffect(() => {
    setAppDialogHandler((payload) => setDialog(payload));
    return () => setAppDialogHandler(null);
  }, []);

  const buttons = useMemo(() => dialog?.buttons?.length ? dialog.buttons : [{ text: 'OK' }], [dialog]);
  const tone = useMemo(() => getDialogTone(dialog?.title || ''), [dialog?.title]);

  const closeAndRun = (onPress?: () => void) => {
    setDialog(null);
    requestAnimationFrame(() => {
      onPress?.();
    });
  };

  return (
    <>
      {children}
      <Modal visible={Boolean(dialog)} transparent animationType="fade" onRequestClose={() => setDialog(null)}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: tone.bg }]}>
              <MaterialCommunityIcons name={tone.icon as any} size={24} color={tone.accent} />
            </View>
            <Text style={styles.title}>{dialog?.title}</Text>
            {dialog?.message ? <Text style={styles.message}>{dialog.message}</Text> : null}
            <View style={styles.actions}>
              {buttons.map((button, index) => {
                const isCancel = button.style === 'cancel';
                const isDanger = button.style === 'destructive';
                const actionStyle = [
                  styles.actionBtn,
                  isCancel ? styles.cancelBtn : styles.primaryBtn,
                  isDanger ? styles.dangerBtn : null,
                ];
                const actionTextStyle = [
                  styles.actionText,
                  isCancel ? styles.cancelText : styles.primaryText,
                  isDanger ? styles.dangerText : null,
                ];

                return (
                  <TouchableOpacity
                    key={`${button.text}-${index}`}
                    style={actionStyle}
                    onPress={() => closeAndRun(button.onPress)}
                    activeOpacity={0.9}
                  >
                    <Text style={actionTextStyle}>{button.text}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  message: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
  actions: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    backgroundColor: colors.orange,
  },
  cancelBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  dangerBtn: {
    backgroundColor: '#DC2626',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  cancelText: {
    color: '#1E293B',
  },
  dangerText: {
    color: '#FFFFFF',
  },
});

export default AppDialogProvider;
