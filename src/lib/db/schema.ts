import { pgTable, text, timestamp, boolean, integer, json, uuid, serial } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  username: text('username').unique(),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

// MFA settings table
export const mfaSettings = pgTable('mfa_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  mfaType: text('mfa_type').notNull(), // 'totp' | 'email' | 'sms'
  secret: text('secret'), // For TOTP
  isEnabled: boolean('is_enabled').default(false).notNull(),
  backupCodes: text('backup_codes'), // JSON array
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Magic links table (for passwordless auth)
export const magicLinks = pgTable('magic_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  token: text('token').unique().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  isUsed: boolean('is_used').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// WebAuthn credentials table
export const webauthnCredentials = pgTable('webauthn_credentials', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  credentialId: text('credential_id').unique().notNull(),
  publicKey: text('public_key').notNull(),
  signCount: integer('sign_count').default(0).notNull(),
  transports: text('transports'), // JSON array
  deviceName: text('device_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sessions table (for JWT token management)
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').unique().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
});

// Security event logs table
export const securityLogs = pgTable('security_logs', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  email: text('email'),
  eventType: text('event_type').notNull(), // 'login_attempt' | 'login_success' | 'mfa_verified' | 'password_change' | 'webauthn_verified' | 'passwordless_requested' | etc.
  status: text('status').notNull(), // 'success' | 'failed'
  reason: text('reason'), // Failure reason
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  metadata: json('metadata'), // Additional data like MFA method, auth method, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  mfaSettings: many(mfaSettings),
  webauthnCredentials: many(webauthnCredentials),
  sessions: many(sessions),
  securityLogs: many(securityLogs),
}));

export const mfaSettingsRelations = relations(mfaSettings, ({ one }) => ({
  user: one(users, {
    fields: [mfaSettings.userId],
    references: [users.id],
  }),
}));

export const webauthnCredentialsRelations = relations(webauthnCredentials, ({ one }) => ({
  user: one(users, {
    fields: [webauthnCredentials.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const securityLogsRelations = relations(securityLogs, ({ one }) => ({
  user: one(users, {
    fields: [securityLogs.userId],
    references: [users.id],
  }),
}));
