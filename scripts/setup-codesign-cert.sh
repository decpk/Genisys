#!/usr/bin/env bash
#
# Creates a stable, self-signed code-signing identity ("Genisys Local") in the
# login keychain.
#
# WHY: the default `npm run tauri:build:adhoc` signs with pure ad-hoc signing
# (`codesign -s -`). Ad-hoc signatures change on every rebuild, so the macOS
# Accessibility (TCC) grant Genisys needs for the "Stay Awake" presence nudge
# attaches to a stale binary and appears to "reset" after each build. Signing
# with a STABLE identity keeps the app's designated requirement constant, so the
# grant persists across rebuilds.
#
# Run once:
#   npm run setup:signing-cert
# Then build with:
#   npm run tauri:build:adhoc:stable
#
set -euo pipefail

CERT_NAME="Genisys Local"
KEYCHAIN="$HOME/Library/Keychains/login.keychain-db"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This script is only needed on macOS." >&2
  exit 0
fi

# Idempotent: a self-signed cert is untrusted, so `find-identity -v` (valid-only)
# would not list it — check WITHOUT -v to see whether a usable identity exists.
if security find-identity -p codesigning 2>/dev/null | grep -q "$CERT_NAME"; then
  echo "✅ Code-signing identity '$CERT_NAME' already exists — nothing to do."
  exit 0
fi

# Remove any orphaned/duplicate "$CERT_NAME" certificates first so codesign is
# never ambiguous about which identity to use.
security find-certificate -a -c "$CERT_NAME" -Z 2>/dev/null \
  | awk '/SHA-1 hash:/ {print $NF}' \
  | while read -r hash; do
      security delete-certificate -Z "$hash" -t >/dev/null 2>&1 || true
    done

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cat > "$TMP/openssl.cnf" <<'EOF'
[req]
distinguished_name = dn
x509_extensions = v3
prompt = no
[dn]
CN = Genisys Local
[v3]
basicConstraints = critical,CA:false
keyUsage = critical,digitalSignature
extendedKeyUsage = critical,codeSigning
EOF

echo "▸ Generating self-signed code-signing certificate…"
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout "$TMP/key.pem" -out "$TMP/cert.pem" \
  -days 3650 -config "$TMP/openssl.cnf" >/dev/null 2>&1

# OpenSSL 3.x writes PKCS#12 with a MAC/cipher Apple's `security` tool cannot
# verify ("MAC verification failed during PKCS12 import"). `-legacy` restores
# the macOS-compatible format. LibreSSL / OpenSSL 1.x already emit it and don't
# understand the flag, so only add it when this openssl supports it.
P12_LEGACY=""
if openssl pkcs12 -help 2>&1 | grep -q -- "-legacy"; then
  P12_LEGACY="-legacy"
fi

openssl pkcs12 -export ${P12_LEGACY} -inkey "$TMP/key.pem" -in "$TMP/cert.pem" \
  -out "$TMP/genisys.p12" -passout pass:genisys -name "$CERT_NAME" >/dev/null 2>&1

echo "▸ Importing into the login keychain…"
# `-A` lets any tool (including codesign) use the private key without a per-build
# keychain prompt. A self-signed cert does NOT need to be *trusted* for codesign
# to sign with it — only present — so no admin or trust prompt is required.
security import "$TMP/genisys.p12" -k "$KEYCHAIN" -P genisys -A >/dev/null 2>&1

# Verify with a real signature: a self-signed cert is untrusted, so
# `find-identity -v` would report it invalid even though codesign can use it.
cp /bin/echo "$TMP/probe"
if security find-identity -p codesigning 2>/dev/null | grep -q "$CERT_NAME" \
  && codesign --force --sign "$CERT_NAME" "$TMP/probe" >/dev/null 2>&1; then
  echo "✅ Created code-signing identity '$CERT_NAME' (verified with a test signature)."
  echo "   Build a persistent-permission app with:  npm run tauri:build:adhoc:stable"
else
  echo "❌ The identity did not import cleanly." >&2
  echo "   Create it via the GUI instead — Keychain Access → Certificate Assistant →" >&2
  echo "   Create a Certificate (Name: '$CERT_NAME', Identity Type: Self Signed Root," >&2
  echo "   Certificate Type: Code Signing)." >&2
  exit 1
fi
