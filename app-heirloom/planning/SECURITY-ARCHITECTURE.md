# Heirloom Security & Privacy Architecture

**Last Updated:** December 1, 2025
**Status:** Draft - Critical Decisions Needed
**Owner:** Brian

---

## The Core Promise

> "Your stories are yours. We can't read them. No one can—unless you choose to share them."

This is a **zero-knowledge architecture** promise. It means:
- Heirloom servers store encrypted data
- Heirloom cannot decrypt user content
- Only users (and those they explicitly share with) can access content
- Even if Heirloom is breached, attacker gets encrypted blobs

**This is hard.** It creates tension with UX (password recovery, family sharing, multi-device). This document explores the options.

---

## Encryption Fundamentals

### What Gets Encrypted

| Data Type | Encrypted? | Notes |
|-----------|------------|-------|
| Video/Audio files | Yes | The core content |
| Photos | Yes | The core content |
| Story titles | Yes | Metadata is sensitive |
| Story transcripts | Yes | If we offer transcription |
| User profile (name) | Partially | Name visible to family |
| Email address | No | Needed for auth/recovery |
| Family relationships | No | Needed for sharing logic |
| Category tags | Encrypted | Part of the story metadata |

### Encryption Layers

```
┌─────────────────────────────────────────────────┐
│              In Transit (TLS 1.3)               │
├─────────────────────────────────────────────────┤
│              At Rest (AES-256)                  │
├─────────────────────────────────────────────────┤
│         End-to-End (User Key Only)              │  ← Zero-knowledge layer
└─────────────────────────────────────────────────┘
```

- **In Transit:** Standard HTTPS/TLS - handled by Supabase
- **At Rest:** Database/storage encryption - handled by Supabase
- **End-to-End:** Client-side encryption before upload - **we must build this**

---

## Architecture Options

### Option A: True Zero-Knowledge (Signal-like)

**How it works:**
1. User creates account with email + password
2. Password → Key Derivation Function (Argon2) → Master Key
3. Master Key encrypts a randomly generated Vault Key
4. Vault Key encrypts all user content
5. Only encrypted Vault Key stored on server
6. Client decrypts everything locally

```
Password ──► Argon2 ──► Master Key ──► Decrypts ──► Vault Key ──► Decrypts ──► Content
                            │
                      (never leaves device)
```

**Family Sharing:**
- User generates a Share Key for each family member
- Share Key is encrypted with recipient's public key
- Recipient decrypts Share Key with their private key
- Share Key decrypts shared content

**Pros:**
- True zero-knowledge - we literally cannot access data
- Strongest privacy story for marketing
- Users own their data completely

**Cons:**
- **No password recovery** - forget password = lose everything
- Complex key exchange for family sharing
- Performance hit (decrypt on every view)
- Can't do server-side search/transcription
- Can't help users who lose access

**Verdict:** Too risky for mainstream consumer product. Users WILL forget passwords.

---

### Option B: Zero-Knowledge with Recovery Key

**How it works:**
- Same as Option A, but...
- During signup, generate a Recovery Key (random 24 words or QR code)
- Recovery Key can decrypt Vault Key
- User must store Recovery Key safely (print it, save to password manager)

**Pros:**
- Still zero-knowledge
- Recovery possible if user saves key

**Cons:**
- Users will lose Recovery Key too
- Extra friction at signup
- "Write down these 24 words" feels like crypto, not family app
- Still can't help users who lose both password AND recovery key

**Verdict:** Better, but still too much friction for target audience (grandparents).

---

### Option C: Server-Assisted Key Recovery (Recommended)

**How it works:**
1. Password → Master Key (same as Option A)
2. Master Key encrypts Vault Key
3. **Additionally:** Vault Key is split using Shamir's Secret Sharing
   - 2-of-3 shares required to reconstruct
   - Share 1: Derived from user's password
   - Share 2: Stored encrypted on Heirloom server
   - Share 3: Stored with trusted recovery contact OR printed recovery key
4. Recovery requires: (Server share + Recovery contact) OR (Password + anything)

**Password Recovery Flow:**
```
User forgets password
        │
        ▼
Verify identity (email + SMS code)
        │
        ▼
Contact recovery contact (family member)
        │
        ▼
Recovery contact approves (from their app)
        │
        ▼
Combine server share + recovery contact share
        │
        ▼
Reconstruct Vault Key, set new password
```

**Pros:**
- Zero-knowledge for content (we hold a share, not the key)
- Recovery possible without losing data
- Family involvement feels on-brand
- Flexible: can add hardware key, authenticator app as shares

**Cons:**
- More complex to implement
- "Recovery contact" adds dependency on another person
- Still need fallback if recovery contact is unavailable
- We hold a share - not pure zero-knowledge (but can't use it alone)

**Verdict:** Best balance of security and usability. Recommended.

---

### Option D: Encrypted but Not Zero-Knowledge

**How it works:**
- Content encrypted at rest on server
- Heirloom holds encryption keys
- Standard security model (like iCloud, Google Photos)
- Can decrypt for features (search, transcription, support)

**Pros:**
- Simple to implement
- Full-featured (search, transcription, recovery)
- Standard industry practice

**Cons:**
- **Breaks the core brand promise**
- We can access user data
- Breach exposes everything
- Competitors offer this already

**Verdict:** Not recommended. Defeats our differentiation.

---

## Recommended Architecture (Option C Detailed)

### Key Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Password                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                          Argon2id KDF
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Master Key (256-bit)                         │
│                  (derived, never stored)                        │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                           Encrypts
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Vault Key (256-bit)                          │
│              (random, encrypted copy on server)                 │
└─────────────┬─────────────────────────────────────┬─────────────┘
              │                                     │
         Encrypts                              Split via
              │                            Shamir's Secret Sharing
              ▼                                     │
┌─────────────────────────┐          ┌─────────────┴─────────────┐
│    Content Keys         │          │   Recovery Shares (2-of-3) │
│  (per-story or per-vault)│          │   - Server share          │
└─────────────────────────┘          │   - Recovery contact share │
                                     │   - Printed backup share   │
                                     └───────────────────────────┘
```

### Encryption Algorithms

| Purpose | Algorithm | Notes |
|---------|-----------|-------|
| Key Derivation | Argon2id | Memory-hard, resists GPU attacks |
| Symmetric Encryption | XChaCha20-Poly1305 | Modern, fast, authenticated |
| Key Wrapping | AES-256-GCM | For encrypting keys |
| Secret Sharing | Shamir's (2-of-3) | For recovery |
| Asymmetric (sharing) | X25519 + Ed25519 | For family key exchange |

### Client-Side Implementation

**Libraries:**
- **libsodium** (via `react-native-sodium` or `libsodium-wrappers`)
- Battle-tested, cross-platform, covers all our needs

**Encryption Flow (Recording):**
```javascript
// 1. User records video
const videoBlob = await recordVideo();

// 2. Generate random content key
const contentKey = sodium.crypto_secretbox_keygen();

// 3. Encrypt video with content key
const nonce = sodium.randombytes_buf(24);
const encryptedVideo = sodium.crypto_secretbox_easy(videoBlob, nonce, contentKey);

// 4. Encrypt content key with vault key
const encryptedContentKey = sodium.crypto_secretbox_easy(contentKey, nonce2, vaultKey);

// 5. Upload encrypted video + encrypted content key
await upload(encryptedVideo, encryptedContentKey, nonce, nonce2);
```

**Decryption Flow (Viewing):**
```javascript
// 1. Download encrypted video + encrypted content key
const { encryptedVideo, encryptedContentKey, nonce, nonce2 } = await download(storyId);

// 2. Decrypt content key with vault key
const contentKey = sodium.crypto_secretbox_open_easy(encryptedContentKey, nonce2, vaultKey);

// 3. Decrypt video with content key
const videoBlob = sodium.crypto_secretbox_open_easy(encryptedVideo, nonce, contentKey);

// 4. Play video
playVideo(videoBlob);
```

---

## Family Sharing Model

### How It Works

1. **Family Creator** (e.g., Mom) creates family vault
2. Family vault has its own **Family Key**
3. Mom encrypts Family Key with her Vault Key
4. Mom invites Dad → generates **Invite Package**:
   - Family Key encrypted with Dad's public key (generated at his signup)
5. Dad accepts → decrypts Family Key with his private key
6. Dad encrypts Family Key with his Vault Key for storage
7. Now both Mom and Dad can decrypt Family Vault content

```
Mom's Vault Key ──► Encrypts ──► Family Key ──► Encrypts ──► Family Content
                                     │
                            Also encrypted for
                                     │
                                     ▼
                            Dad's Public Key
                                     │
                            Dad decrypts with
                                     │
                                     ▼
                            Dad's Private Key
```

### Permission Levels

| Level | Can View | Can Add | Can Invite | Can Remove |
|-------|----------|---------|------------|------------|
| Owner | Yes | Yes | Yes | Yes |
| Admin | Yes | Yes | Yes | No |
| Member | Yes | Yes | No | No |
| Viewer | Yes | No | No | No |

### Key Rotation

When a family member is removed:
1. Generate new Family Key
2. Re-encrypt all Family Vault content with new key
3. Distribute new key to remaining members
4. Removed member's copy becomes useless

**Note:** This is expensive for large vaults. Consider:
- Lazy re-encryption (re-encrypt on next access)
- Accept that removed members retain access to old content (simpler)

---

## Multi-Device Sync

### Challenge
Vault Key must be available on all user devices, but we don't store it.

### Solution
1. First device: Vault Key encrypted with Master Key, stored on server
2. New device login:
   - User enters password
   - Password → Master Key
   - Download encrypted Vault Key
   - Decrypt with Master Key
   - Device now has Vault Key in memory/secure storage

### Secure Storage (Mobile)

| Platform | Storage | Notes |
|----------|---------|-------|
| iOS | Keychain | Hardware-backed on devices with Secure Enclave |
| Android | Keystore | Hardware-backed on most modern devices |
| Web | IndexedDB + encryption | Less secure, consider session-only |

Use `expo-secure-store` for React Native - wraps both platforms.

---

## Password Recovery Flow

### With Recovery Contact

```
┌─────────────────────────────────────────────────────────────────┐
│  User: "I forgot my password"                                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Verify identity: Email + SMS code                              │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Send recovery request to Recovery Contact                      │
│  (push notification + in-app prompt)                            │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Recovery Contact approves (enters their password to release    │
│  their share of user's recovery key)                            │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Combine: Server Share + Recovery Contact Share                 │
│  Reconstruct Vault Key                                          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  User sets new password                                         │
│  New Master Key encrypts Vault Key                              │
│  Generate new recovery shares                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Without Recovery Contact (Backup Key)

If user printed/saved their backup share:
1. Verify identity (email + SMS)
2. User enters backup share (24 words or scans QR)
3. Combine: Server Share + Backup Share
4. Reconstruct Vault Key
5. Set new password

### Total Loss Scenario

If user loses:
- Password
- Recovery contact unavailable
- Backup share lost

**Result:** Data is unrecoverable. This is the trade-off for zero-knowledge.

**Mitigation:**
- Strongly encourage recovery contact setup
- Periodic reminders to verify recovery method
- Option to add multiple recovery contacts
- Clear warnings during signup about this risk

---

## Compliance

### GDPR

| Requirement | How We Comply |
|-------------|---------------|
| Data access | User can export all data (decrypted) from app |
| Data deletion | Delete encrypted blobs + key material = data destroyed |
| Data portability | Export in standard formats (MP4, JPG, JSON) |
| Consent | Explicit consent at signup |
| Breach notification | 72-hour notification (but breached data is encrypted) |

### CCPA

| Requirement | How We Comply |
|-------------|---------------|
| Right to know | Privacy policy + in-app data summary |
| Right to delete | Full account deletion with key destruction |
| Right to opt-out | No data selling (we can't read it anyway) |

### SOC 2 (Future)

For HaaS enterprise customers, may need SOC 2 Type II certification. Plan for:
- Audit logging
- Access controls
- Incident response procedures
- Vendor security assessments

---

## Security Threats & Mitigations

| Threat | Mitigation |
|--------|------------|
| Server breach | Data encrypted, keys not on server |
| Man-in-the-middle | TLS 1.3 + certificate pinning |
| Weak passwords | Enforce minimum strength, use Argon2 |
| Device theft | Biometric unlock, remote wipe option |
| Malicious family member | Permissions model, audit log |
| Insider threat (employee) | We can't access data, audit logs for metadata |
| Account takeover | MFA, device verification, recovery contact approval |
| Key extraction (rooted device) | Hardware-backed keystore where available |

---

## Implementation Phases

### Phase 1: MVP (Simplified)

For MVP, implement a simpler version:
- Password-derived encryption (Option A basics)
- Recovery key only (no recovery contact yet)
- Single-device focus (multi-device later)
- Family sharing with static keys (no rotation)

**Why:** Get to market, prove value, iterate on security

### Phase 2: Full Security

- Add recovery contact system
- Implement Shamir's secret sharing
- Key rotation on member removal
- MFA options
- Audit logging

### Phase 3: Enterprise

- SOC 2 compliance
- Hardware security key support
- Admin controls for HaaS
- Advanced audit/compliance reporting

---

## Open Questions

1. **Recovery contact UX:** How do we explain this simply? "Digital inheritance contact"?

2. **What if recovery contact dies?** Need ability to change recovery contact, maybe allow multiple.

3. **Transcription:** If we want AI transcription, it must happen client-side or we break zero-knowledge. Options:
   - Whisper.cpp on-device (large model, slow)
   - User opts in to server-side (breaks promise for that content)
   - No transcription in MVP

4. **Search:** Can't search encrypted content server-side. Options:
   - Client-side search (download all metadata, search locally)
   - Encrypted search indexes (complex)
   - Search by category/date only (simpler)

5. **Legal requests:** What do we do if law enforcement requests data?
   - We provide encrypted blobs (useless without keys)
   - Transparency report
   - Warrant canary?

---

## Dependencies

- **Crypto library:** `libsodium` via `react-native-sodium`
- **Secure storage:** `expo-secure-store`
- **Backend:** Supabase (stores encrypted blobs + encrypted keys)

---

## Next Steps

1. [ ] Decide on MVP security level (full zero-knowledge vs. simplified)
2. [ ] Prototype encryption/decryption in React Native
3. [ ] Design recovery contact UX flow
4. [ ] Draft privacy policy with legal review
5. [ ] Security audit before launch (external firm)
