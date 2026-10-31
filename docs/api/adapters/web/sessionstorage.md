# SessionStorage Adapter

Session-scoped browser storage using the sessionStorage API.

## Overview

The SessionStorage adapter provides temporary storage that persists for the duration of the browser tab/window session. Data is cleared when the tab is closed.

### Capabilities

| Feature | Support |
|---------|----------|
| Persistence | 🔄 Session only |
| Synchronous | ✅ Yes |
| Observable | ✅ Yes (same-tab changes; no cross-tab sync) |
| Searchable | ✅ Yes |
| Iterable | ✅ Yes |
| Capacity | Varies by browser and available device storage |
| Performance | 🚀 Fast |
| TTL Support | ✅ Yes (manual) |
| Batch Support | ✅ Yes |
| Transaction Support | ❌ No |

:::info Shared storage area — key ownership
This area is shared with every other script on the origin. Since 3.0.0, the adapter prefixes keys with
`strata:` by default. The adapter has also checked the stored `StorageValue` envelope since 2.9.0, so
`keys()`, the TTL sweep and `clear()` never touch data this library did not write. A key written here by
anything else is invisible to `keys()` by design; `setLogLevel('debug')` shows what is being skipped.
Full explanation: [Configuration ▸ key ownership](../../../configuration.md#key-ownership).
:::

## Usage

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage();

// Explicitly use sessionStorage
await storage.set('sessionData', data, { storage: 'sessionStorage' });
```

## Configuration

```typescript
const storage = defineStorage({
  adapters: {
    sessionStorage: {
      prefix: 'session_'
    }
  }
});
```

### Configuration Options

- `prefix` (string): Physical key prefix. The instance-level default is `strata:`; this adapter option overrides it. Serialization callbacks are not part of `StrataConfig`.

## Features

### Tab Isolation

```typescript
// Each tab has its own sessionStorage
// Tab 1
await storage.set('tabId', 'tab1', { storage: 'sessionStorage' });

// Tab 2 (different tab)
const tabId = await storage.get('tabId', { storage: 'sessionStorage' });
console.log(tabId); // null - different session
```

### Session Persistence

```typescript
// Data survives page refresh within the same tab
await storage.set('formProgress', { step: 3 }, { 
  storage: 'sessionStorage' 
});

// After page refresh (same tab)
const progress = await storage.get('formProgress', { 
  storage: 'sessionStorage' 
});
console.log(progress); // { step: 3 }
```

### Automatic Cleanup

```typescript
// No manual cleanup needed - cleared when tab closes
await storage.set('tempData', data, { storage: 'sessionStorage' });
// Automatically cleared when user closes the tab
```

## Use Cases

### 1. Multi-Step Forms

```typescript
class FormWizard {
  private currentStep = 1;
  private formKey = 'wizard_data';
  
  async saveStep(stepData: unknown) {
    const existing = await this.getFormData();
    const updated = {
      ...existing,
      [`step${this.currentStep}`]: stepData,
      currentStep: this.currentStep,
      lastUpdated: Date.now()
    };
    
    await storage.set(this.formKey, updated, {
      storage: 'sessionStorage'
    });
  }
  
  async getFormData() {
    return await storage.get(this.formKey, {
      storage: 'sessionStorage'
    }) || {};
  }
  
  async nextStep() {
    this.currentStep++;
    await this.saveStep({ step: this.currentStep });
  }
  
  async submitForm() {
    const formData = await this.getFormData();
    await api.submitForm(formData);
    
    // Clear after submission
    await storage.remove(this.formKey, {
      storage: 'sessionStorage'
    });
  }
}
```

### 2. Shopping Session

```typescript
class SessionCart {
  async addItem(item: CartItem) {
    const cart = await this.getCart();
    cart.items.push(item);
    cart.sessionId = cart.sessionId || generateSessionId();
    
    await storage.set('session_cart', cart, {
      storage: 'sessionStorage'
    });
  }
  
  async getCart() {
    return await storage.get('session_cart', {
      storage: 'sessionStorage'
    }) || { items: [], sessionId: null };
  }
  
  async convertToUser(userId: string) {
    const sessionCart = await this.getCart();
    
    // Move to persistent storage
    await storage.set(`cart:${userId}`, sessionCart, {
      storage: 'localStorage'
    });
    
    // Clear session cart
    await storage.remove('session_cart', {
      storage: 'sessionStorage'
    });
  }
}
```

### 3. Temporary signed-in page state

Keep only recreatable interface state here, such as the selected tab or an
unfinished search. Let your authentication system manage credentials; a value
in `sessionStorage` is readable by scripts on the page and cannot prove that a
user is signed in.

### 4. Page State Management

```typescript
class PageStateManager {
  async saveScrollPosition(page: string) {
    await storage.set(`scroll:${page}`, {
      x: window.scrollX,
      y: window.scrollY,
      timestamp: Date.now()
    }, {
      storage: 'sessionStorage'
    });
  }
  
  async restoreScrollPosition(page: string) {
    const position = await storage.get(`scroll:${page}`, {
      storage: 'sessionStorage'
    });
    
    if (position) {
      window.scrollTo(position.x, position.y);
    }
  }
  
  async saveFilters(filters: FilterOptions) {
    await storage.set('page_filters', filters, {
      storage: 'sessionStorage'
    });
  }
  
  async getFilters() {
    return await storage.get('page_filters', {
      storage: 'sessionStorage'
    });
  }
}
```

## Storage Behavior

### Tab Duplication

```typescript
// When duplicating a tab, sessionStorage is copied
// Original tab
await storage.set('data', { value: 1 }, { 
  storage: 'sessionStorage' 
});

// Duplicated tab starts with same data
const data = await storage.get('data', { 
  storage: 'sessionStorage' 
});
console.log(data); // { value: 1 }

// But changes are independent
await storage.set('data', { value: 2 }, { 
  storage: 'sessionStorage' 
});
// Original tab still has { value: 1 }
```

### Navigation Behavior

```typescript
// SessionStorage persists across:
// - Page refresh (F5)
// - Navigation within same origin
// - History back/forward

// SessionStorage is cleared when:
// - Tab is closed
// - Browser is closed
// - New tab is opened (even to same URL)
```

## Best Practices

### 1. Use for Temporary State

```typescript
// Good: Temporary form data
await storage.set('formDraft', draft, { 
  storage: 'sessionStorage' 
});

// Bad: User preferences (use localStorage)
await storage.set('theme', 'dark', { 
  storage: 'localStorage' // Better choice
});
```

### 2. Implement Recovery

```typescript
class SessionManager {
  async getOrCreate(key: string, factory: () => Promise<unknown>) {
    let value = await storage.get(key, { 
      storage: 'sessionStorage' 
    });
    
    if (!value) {
      value = await factory();
      await storage.set(key, value, { 
        storage: 'sessionStorage' 
      });
    }
    
    return value;
  }
}

// Usage
const sessionId = await sessionManager.getOrCreate(
  'sessionId',
  async () => generateSessionId()
);
```

### 3. Clean Up Sensitive Data

```typescript
// Clear recreatable session data explicitly on sign-out.
class SecureSession {
  async logout() {
    await storage.clear({ storage: 'sessionStorage', prefix: 'session_' });
  }
}
```

### 4. Handle Tab Communication

```typescript
// Since sessionStorage doesn't sync between tabs,
// use localStorage or BroadcastChannel for tab communication

class TabCoordinator {
  async setLeaderTab() {
    const tabId = generateTabId();
    
    // Store in session
    await storage.set('tabId', tabId, {
      storage: 'sessionStorage'
    });
    
    // Announce to other tabs via localStorage
    await storage.set('activeTab', tabId, {
      storage: 'localStorage',
      ttl: 5000 // 5 second heartbeat
    });
  }
}
```

## Performance Optimization

### 1. Minimize Storage Size

```typescript
// SessionStorage has same size limits as localStorage
// Keep data compact

interface CompactSession {
  id: string;
  s: number; // start time
  u: number; // last update
  d: unknown; // data
}

// Use short keys for frequently accessed data
await storage.set('s', compactSession, {
  storage: 'sessionStorage'
});
```

### 2. Batch Operations

```typescript
// Batch multiple operations
const updates = [
  { key: 'view1', value: data1 },
  { key: 'view2', value: data2 },
  { key: 'view3', value: data3 }
];

for (const { key, value } of updates) {
  await storage.set(key, value, { 
    storage: 'sessionStorage' 
  });
}
```

## Security Considerations

### 1. Session tokens

Do not treat a browser-stored user agent, origin, or expiry field as proof of a
valid login. The server must validate its own session or access token on every
protected request. Avoid putting reusable credentials in browser storage.

### 2. Data Sensitivity

```typescript
// Be cautious with sensitive data
// SessionStorage is accessible via JavaScript

// Encryption requires a password supplied separately from browser storage.
await storage.set('sensitiveData', data, {
  storage: 'sessionStorage',
  encrypt: true,
  encryptionPassword: sessionKey
});
```

## Comparison with LocalStorage

| Feature | SessionStorage | LocalStorage |
|---------|---------------|---------------|
| Persistence | Tab session | Permanent |
| Sharing | Tab-specific | Domain-wide |
| Capacity | Browser-dependent | Browser-dependent |
| Use Case | Temporary state | User preferences |
| Auto-cleanup | Yes (tab close) | No |

## Migration Strategy

```typescript
// Graceful fallback when sessionStorage unavailable
const sessionFallback = ['sessionStorage', 'memory'];

await storage.set('data', value, {
  storage: sessionFallback
});

// Detect private browsing mode
function hasSessionStorage() {
  try {
    const test = '__test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
```

## See Also

- [Storage Adapters Overview](../README.md)
- [LocalStorage Adapter](./localstorage.md) - Persistent storage
- [Memory Adapter](./memory.md) - Non-persistent alternative
