# DOKU HMAC-SHA256 Request Signature Guide

This guide details the exact cryptographic signature formulas and implementations required for authenticating requests to DOKU Payment Gateway (Jokul API v2).

---

## 1. Authentication Headers Overview

Every HTTP request to DOKU Payment Gateway endpoints must include six mandatory HTTP headers:

| Header Name | Type | Description / Format | Example Value |
|---|---|---|---|
| `Client-Id` | String | Merchant Client ID from DOKU Back Office | `MCH-12345678` |
| `Request-Id` | String | Unique UUID v4 per HTTP request | `f47ac10b-58cc-4372-a567-0e02b2c3d479` |
| `Request-Timestamp` | String | UTC ISO8601 timestamp **without milliseconds** | `2026-08-09T02:00:00Z` |
| `Request-Target` | String | API Target endpoint path (including query params if any) | `/checkout/v1/payment` |
| `Digest` | String | Base64-encoded SHA-256 hash of raw JSON body *(Omitted for `GET`)* | `47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=` |
| `Signature` | String | Signature formatted as `HMACSHA256=<base64-signature>` | `HMACSHA256=w4nN9...` |

---

## 2. Signature Calculation Formula

### Step 1: Calculate Digest Hash (`POST`, `PUT`, `PATCH`)
Take the raw JSON body string, hash it with **SHA-256**, then **Base64** encode the resulting binary buffer.
```text
Raw JSON String -> SHA256 Hash -> Base64 Encode -> Digest
```
*Note: For `GET` requests, skip Digest calculation.*

### Step 2: Component String Assembly
Construct the raw signature string by concatenating mandatory headers separated by newline (`\n`):
```text
Client-Id:<CLIENT_ID>\nRequest-Id:<REQUEST_ID>\nRequest-Timestamp:<TIMESTAMP>\nRequest-Target:<TARGET_PATH>\nDigest:<DIGEST_STRING>
```

> [!CAUTION]
> 1. Do **NOT** add a trailing newline (`\n`) at the end of the component string.
> 2. For `GET` requests, completely omit `\nDigest:<DIGEST_STRING>` from component assembly.
> 3. `Request-Target` must include exact path and query string (e.g. `/orders/v1/status/INV-101`).

### Step 3: HMAC-SHA256 Signing
Sign the component string using your **DOKU Secret Key** as the HMAC key with **SHA-256**, Base64-encode the result, and prepend `HMACSHA256=`.
```text
HMAC-SHA256(SecretKey, ComponentString) -> Base64 Encode -> Prepend "HMACSHA256="
```

---

## 3. Multi-Language Implementations

### Node.js / TypeScript
```typescript
import crypto from 'crypto';

export interface DokuSignatureParams {
  clientId: string;
  secretKey: string;
  requestId: string;
  timestamp: string; // ISO8601 without ms, e.g. "2026-08-09T00:00:00Z"
  targetPath: string; // e.g. "/checkout/v1/payment"
  body?: object;
}

export function generateDokuSignature(params: DokuSignatureParams): { digest?: string; signature: string } {
  let digestString = '';

  if (params.body && Object.keys(params.body).length > 0) {
    const jsonBody = JSON.stringify(params.body);
    const hash = crypto.createHash('sha256').update(jsonBody, 'utf8').digest();
    digestString = hash.toString('base64');
  }

  let componentStr = `Client-Id:${params.clientId}\nRequest-Id:${params.requestId}\nRequest-Timestamp:${params.timestamp}\nRequest-Target:${params.targetPath}`;

  if (digestString) {
    componentStr += `\nDigest:${digestString}`;
  }

  const hmac = crypto.createHmac('sha256', params.secretKey);
  hmac.update(componentStr, 'utf8');
  const base64Signature = hmac.digest('base64');

  return {
    digest: digestString || undefined,
    signature: `HMACSHA256=${base64Signature}`
  };
}
```

### Python (3.10+)
```python
import base64
import hashlib
import hmac
import json
from typing import Dict, Any, Optional, Tuple

def generate_doku_signature(
    client_id: str,
    secret_key: str,
    request_id: str,
    timestamp: str,
    target_path: str,
    body: Optional[Dict[str, Any]] = None
) -> Tuple[Optional[str], str]:
    digest_str = None
    
    if body:
        json_bytes = json.dumps(body, separators=(',', ':')).encode('utf-8')
        digest_bytes = hashlib.sha256(json_bytes).digest()
        digest_str = base64.b64encode(digest_bytes).decode('utf-8')

    component_str = (
        f"Client-Id:{client_id}\n"
        f"Request-Id:{request_id}\n"
        f"Request-Timestamp:{timestamp}\n"
        f"Request-Target:{target_path}"
    )

    if digest_str:
        component_str += f"\nDigest:{digest_str}"

    hmac_obj = hmac.new(
        secret_key.encode('utf-8'),
        component_str.encode('utf-8'),
        hashlib.sha256
    )
    raw_signature = base64.b64encode(hmac_obj.digest()).decode('utf-8')
    return digest_str, f"HMACSHA256={raw_signature}"
```

### Go (1.20+)
```go
package doku

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
)

type SignatureResult struct {
	Digest    string
	Signature string
}

function GenerateDokuSignature(
	clientID, secretKey, requestID, timestamp, targetPath string,
	body interface{},
) (*SignatureResult, error) {
	var digestStr string

	if body != nil {
		jsonBytes, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		hash := sha256.Sum256(jsonBytes)
		digestStr = base64.StdEncoding.EncodeToString(hash[:])
	}

	componentStr := fmt.Sprintf(
		"Client-Id:%s\nRequest-Id:%s\nRequest-Timestamp:%s\nRequest-Target:%s",
		clientID, requestID, timestamp, targetPath,
	)

	if digestStr != "" {
		componentStr += fmt.Sprintf("\nDigest:%s", digestStr)
	}

	h := hmac.New(sha256.New, []byte(secretKey))
	h.Write([]byte(componentStr))
	signature := fmt.Sprintf("HMACSHA256=%s", base64.StdEncoding.EncodeToString(h.Sum(nil)))

	return &SignatureResult{
		Digest:    digestStr,
		Signature: signature,
	}, nil
}
```

---

## 4. Common Troubleshooting & Debugging

| Error Symptom | Root Cause | Solution |
|---|---|---|
| `Authorization Failed` / `Invalid Signature` | Trailing `\n` at end of raw string | Ensure component string has NO newline after `Digest` |
| `Invalid Timestamp` | ISO8601 string includes `.123Z` milliseconds | Format as `.replace(/\.\d{3}Z$/, 'Z')` in JavaScript |
| `Digest Mismatch` | Differing JSON whitespace/ordering | Ensure JSON body passed to Digest generation matches exact string sent in HTTP body |
| `GET Request Failure` | Included `Digest` in component string for `GET` | Omit `Digest` header and component line for `GET` requests |
