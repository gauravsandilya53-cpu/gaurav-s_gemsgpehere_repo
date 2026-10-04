/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * UsersRolesCategory.tsx — Team Management & Role-Based Access Control (RBAC).
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../../core/theme';
import { GlassCard } from '../../../components/ui/GlassCard';
import { PremiumButton } from '../../../components/ui/PremiumButton';
import { useSettingsStore, UserMember } from '../settingsStore';

interface Props {
  onShowToast: (message: string) => void;
}

export const UsersRolesCategory: React.FC<Props> = ({ onShowToast }) => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const store = useSettingsStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [newUser, setNewUser] = useState<{
    name: string;
    email: string;
    role: UserMember['role'];
    status: UserMember['status'];
  }>({
    name: '',
    email: '',
    role: 'Sales',
    status: 'Active',
  });

  const handleAddUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      Alert.alert('Validation Error', 'Please enter user name and valid email.');
      return;
    }
    store.addUser(newUser);
    setModalVisible(false);
    setNewUser({ name: '', email: '', role: 'Sales', status: 'Active' });
    onShowToast(`Team member ${newUser.name} added!`);
  };

  const handleRemove = (user: UserMember) => {
    if (user.role === 'Admin' && store.users.filter((u) => u.role === 'Admin').length <= 1) {
      Alert.alert('Action Denied', 'Cannot remove the sole Administrator account.');
      return;
    }
    Alert.alert('Confirm Remove', `Remove ${user.name} from business team?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          store.removeUser(user.id);
          onShowToast(`User ${user.name} removed.`);
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[Typography.h2, { color: Palette.text }]}>Users, Roles & Permissions</Text>
            <Text style={[Typography.body, { color: Palette.textMuted, marginTop: 2 }]}>
              Manage business team members and role-based permissions (RBAC).
            </Text>
          </View>
          <PremiumButton
            label="Add Team Member"
            variant="primary"
            size="md"
            onPress={() => setModalVisible(true)}
            icon={<Ionicons name="person-add-outline" size={16} color="#FFF" />}
          />
        </View>
      </View>

      {/* Team Users List */}
      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>ACTIVE TEAM MEMBERS ({store.users.length})</Text>

        {store.users.map((user, idx) => (
          <View
            key={user.id}
            style={[
              styles.userRow,
              idx < store.users.length - 1 && { borderBottomWidth: 1, borderBottomColor: Palette.divider },
            ]}
          >
            <View style={[styles.avatarBox, { backgroundColor: `${Palette.primary}18` }]}>
              <Text style={[Typography.bodySemibold, { color: Palette.primary }]}>
                {user.name.substring(0, 2).toUpperCase()}
              </Text>
            </View>

            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={[Typography.bodySemibold, { color: Palette.text }]}>{user.name}</Text>
              <Text style={[Typography.caption, { color: Palette.textMuted }]}>{user.email}</Text>
            </View>

            {/* Role Dropdown Chip */}
            <View style={{ marginRight: Spacing.md }}>
              <View style={[styles.roleChip, { backgroundColor: `${Palette.primary}15`, borderColor: Palette.primary }]}>
                <Text style={[Typography.caption, { color: Palette.primary, fontWeight: '700' }]}>
                  {user.role}
                </Text>
              </View>
            </View>

            {/* Remove Action */}
            <TouchableOpacity onPress={() => handleRemove(user)} style={{ padding: 6 }}>
              <Ionicons name="trash-outline" size={18} color={Palette.error} />
            </TouchableOpacity>
          </View>
        ))}
      </GlassCard>

      {/* Permissions Matrix */}
      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>ROLE PERMISSIONS MATRIX (RBAC)</Text>

        <View style={[styles.matrixHeader, { backgroundColor: Palette.background, borderColor: Palette.border }]}>
          <Text style={[Typography.captionMedium, { color: Palette.text, flex: 2, fontWeight: '700' }]}>Role</Text>
          <Text style={[Typography.caption, { color: Palette.textMuted, flex: 1, textAlign: 'center' }]}>View</Text>
          <Text style={[Typography.caption, { color: Palette.textMuted, flex: 1, textAlign: 'center' }]}>Create</Text>
          <Text style={[Typography.caption, { color: Palette.textMuted, flex: 1, textAlign: 'center' }]}>Edit</Text>
          <Text style={[Typography.caption, { color: Palette.textMuted, flex: 1, textAlign: 'center' }]}>Delete</Text>
          <Text style={[Typography.caption, { color: Palette.textMuted, flex: 1, textAlign: 'center' }]}>Export</Text>
        </View>

        {Object.entries(store.rolePermissions).map(([roleName, perms]) => (
          <View key={roleName} style={[styles.matrixRow, { borderBottomColor: Palette.border }]}>
            <Text style={[Typography.bodySemibold, { color: Palette.text, flex: 2 }]}>{roleName}</Text>
            {['view', 'create', 'edit', 'delete', 'export'].map((permKey) => (
              <View key={permKey} style={{ flex: 1, alignItems: 'center' }}>
                <Ionicons
                  name={(perms as any)[permKey] ? 'checkmark-circle' : 'close-circle-outline'}
                  size={18}
                  color={(perms as any)[permKey] ? Palette.success : Palette.textMuted}
                />
              </View>
            ))}
          </View>
        ))}
      </GlassCard>

      {/* Add User Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <Text style={[Typography.h3, { color: Palette.text, marginBottom: Spacing.md }]}>Add New Team Member</Text>

            <Text style={[styles.label, { color: Palette.text }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
              value={newUser.name}
              onChangeText={(text) => setNewUser({ ...newUser, name: text })}
              placeholder="e.g. Ramesh Kumar"
              placeholderTextColor={Palette.textMuted}
            />

            <Text style={[styles.label, { color: Palette.text, marginTop: Spacing.sm }]}>Email Address</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
              value={newUser.email}
              onChangeText={(text) => setNewUser({ ...newUser, email: text })}
              keyboardType="email-address"
              placeholder="ramesh@business.com"
              placeholderTextColor={Palette.textMuted}
            />

            <Text style={[styles.label, { color: Palette.text, marginTop: Spacing.sm }]}>Assigned Role</Text>
            <View style={styles.pillGroup}>
              {(['Admin', 'Accountant', 'Sales', 'Viewer'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.pillChoice,
                    {
                      backgroundColor: newUser.role === r ? Palette.primary : Palette.background,
                      borderColor: Palette.border,
                    },
                  ]}
                  onPress={() => setNewUser({ ...newUser, role: r })}
                >
                  <Text style={[Typography.captionMedium, { color: newUser.role === r ? '#FFF' : Palette.text }]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: Spacing.lg, gap: 8 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={[Typography.bodySemibold, { color: Palette.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <PremiumButton label="Add Member" variant="primary" size="md" onPress={handleAddUser} />
            </View>
          </GlassCard>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: Spacing.lg },
  header: { marginBottom: Spacing.lg },
  card: { padding: Spacing.lg, marginBottom: Spacing.lg },
  sectionTitle: { ...Typography.caption, fontWeight: '700', letterSpacing: 1.2, marginBottom: Spacing.md },
  userRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md },
  avatarBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  roleChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1 },
  matrixHeader: { flexDirection: 'row', padding: Spacing.sm, borderRadius: Radius.sm, borderWidth: 1, marginBottom: 4 },
  matrixRow: { flexDirection: 'row', paddingVertical: Spacing.sm, borderBottomWidth: 1, alignItems: 'center' },
  label: { ...Typography.captionMedium, fontWeight: '600', marginBottom: 4 },
  input: { height: 44, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, ...Typography.body },
  pillGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  pillChoice: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  modalCard: { width: '100%', maxWidth: 440, padding: Spacing.lg },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, justifyContent: 'center' },
});
