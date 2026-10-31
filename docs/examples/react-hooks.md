# React Hooks Examples

Examples of using Strata Storage with React hooks integration.

## Setup

```typescript
import {
  StrataProvider,
  useStrata,
  useStorage,
  useStorageQuery,
} from 'strata-storage/react';

// Wrap your app, then use the provider-bound hooks below anywhere inside it.
function App() {
  return (
    <StrataProvider config={{ namespace: 'my-app' }}>
      <YourApp />
    </StrataProvider>
  );
}
```

> Prefer no Provider? Create an instance with `defineStorage()` and bind the same hooks with `createStrataHooks(instance)` (2.5.0+). The examples below use the Provider-bound hooks for consistency.

## Basic Hook Usage

### useStrata Hook

```typescript
function UserProfile() {
  const storage = useStrata();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    storage.get('current_user').then(setUser);
  }, []);
  
  const updateUser = async (updates) => {
    const updated = { ...user, ...updates };
    await storage.set('current_user', updated);
    setUser(updated);
  };
  
  return (
    <div>
      <h1>{user?.name}</h1>
      <button onClick={() => updateUser({ name: 'New Name' })}>
        Update Name
      </button>
    </div>
  );
}
```

### useStorage Hook

`useStorage<T>(key, defaultValue?, options?)` returns `[value, setValue, loading]`. `value` is `T | null` until the first read resolves, so guard on `loading`/fall back to the default in the markup.

```typescript
function Settings() {
  const [theme, setTheme, loadingTheme] = useStorage<string>('theme', 'light');
  const [language, setLanguage, loadingLang] = useStorage<string>('language', 'en');

  if (loadingTheme || loadingLang) return <p>Loading…</p>;

  return (
    <div>
      <select value={theme ?? 'light'} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>

      <select value={language ?? 'en'} onChange={(e) => setLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="es">Spanish</option>
      </select>
    </div>
  );
}
```

## Advanced Patterns

### Persistent Form State

```typescript
function ContactForm() {
  const [formData, setFormData, loading] = useStorage('contact_form_draft', {
    name: '',
    email: '',
    message: ''
  });

  if (loading || formData === null) return <p>Loading…</p>;

  // setValue takes the next value (not a functional updater) — spread the current value.
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitForm(formData);
    await setFormData({ name: '', email: '', message: '' }); // Clear draft
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        placeholder="Name"
      />
      <input
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        placeholder="Email"
      />
      <textarea
        value={formData.message}
        onChange={(e) => handleChange('message', e.target.value)}
        placeholder="Message"
      />
      <button type="submit">Send</button>
    </form>
  );
}
```

### Shopping Cart with Sync

```typescript
function useShoppingCart() {
  const storage = useStrata();
  const [cart, setCart] = useState({ items: [], total: 0 });
  
  // Load cart on mount
  useEffect(() => {
    storage.get('shopping_cart').then(data => {
      if (data) setCart(data);
    });
  }, []);
  
  // Subscribe to changes from other tabs
  useEffect(() => {
    const unsubscribe = storage.subscribe((change) => {
      if (change.key === 'shopping_cart' && change.source === 'remote') {
        setCart(change.newValue);
      }
    });
    
    return unsubscribe;
  }, []);
  
  const addItem = async (item) => {
    const updated = {
      items: [...cart.items, item],
      total: cart.total + item.price
    };
    await storage.set('shopping_cart', updated);
    setCart(updated);
  };
  
  const removeItem = async (itemId) => {
    const item = cart.items.find(i => i.id === itemId);
    const updated = {
      items: cart.items.filter(i => i.id !== itemId),
      total: cart.total - (item?.price || 0)
    };
    await storage.set('shopping_cart', updated);
    setCart(updated);
  };
  
  return { cart, addItem, removeItem };
}

// Usage
function ShoppingCart() {
  const { cart, addItem, removeItem } = useShoppingCart();
  
  return (
    <div>
      <h2>Cart ({cart.items.length} items)</h2>
      {cart.items.map(item => (
        <div key={item.id}>
          {item.name} - ${item.price}
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}
      <div>Total: ${cart.total}</div>
    </div>
  );
}
```

### Auth State Management

The server owns authentication. The hook can display its session state, but a value in Strata Storage is not proof of sign-in. This example assumes the host app exposes a cookie-backed `/api/session` endpoint:

```typescript
function useAuth() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/session', { credentials: 'include' })
      .then(response => response.ok ? response.json() : null)
      .then(setAccount)
      .finally(() => setLoading(false));
  }, []);

  return { account, loading };
}
```

Keep the browser session credential in a server-issued `HttpOnly` cookie. Strata's JavaScript cookie adapter cannot create one.

### Offline Queue

```typescript
function useOfflineQueue() {
  const storage = useStrata();
  const [queue, setQueue] = useState([]);
  const [online, setOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    // Load queue
    storage.get('offline_queue').then(data => {
      if (data) setQueue(data);
    });
    
    // Monitor online status
    const handleOnline = () => {
      setOnline(true);
      processQueue();
    };
    
    const handleOffline = () => setOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const addToQueue = async (action) => {
    const updated = [...queue, { ...action, id: Date.now() }];
    await storage.set('offline_queue', updated);
    setQueue(updated);
    
    if (online) processQueue();
  };
  
  const processQueue = async () => {
    const pending = await storage.get('offline_queue') || [];
    
    for (const action of pending) {
      try {
        await processAction(action);
        // Remove from queue
        const remaining = pending.filter(a => a.id !== action.id);
        await storage.set('offline_queue', remaining);
        setQueue(remaining);
      } catch (error) {
        console.error('Failed to process:', action);
        break; // Stop on first failure
      }
    }
  };
  
  return { addToQueue, queue, online };
}
```

### Query Hook

`useStorageQuery(condition, options?)` is exported from `strata-storage/react`. It returns `{ data, loading, refetch }` and re-runs when storage changes. The condition matches the **decoded value** by bare field names (no `value.` prefix; the key is not part of the condition), so store records as objects with the fields you want to filter on.

```typescript
// Usage — users are stored as objects like { name, role }
function UserList() {
  const [role, setRole] = useState('user');
  const { data: users, loading } = useStorageQuery({ role });

  return (
    <div>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="user">Users</option>
        <option value="admin">Admins</option>
      </select>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {users.map(user => (
            <li key={user.key}>{user.value.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Custom Hooks

### usePersistentState

```typescript
function usePersistentState(key, initialValue, options = {}) {
  const storage = useStrata();
  const [state, setState] = useState(initialValue);
  const [loaded, setLoaded] = useState(false);
  
  // Load initial value
  useEffect(() => {
    storage.get(key).then(value => {
      if (value !== null) setState(value);
      setLoaded(true);
    });
  }, [key]);
  
  // Update storage when state changes
  useEffect(() => {
    if (loaded) {
      storage.set(key, state, options);
    }
  }, [state, loaded]);
  
  return [state, setState, loaded];
}
```

### useEncryptedStorage

Create the instance with encryption enabled before wrapping it in a hook. Passing `encrypt: true` to an unconfigured `useStrata()` instance does not initialise the encryption manager.

```typescript
import { defineStorage } from 'strata-storage';

const encryptedStorage = defineStorage({ encryption: { enabled: true } });

function useEncryptedStorage(password: string) {
  return useMemo(() => ({
    set: (key: string, value: unknown) => encryptedStorage.set(key, value, {
      encrypt: true,
      encryptionPassword: password,
    }),
    get: (key: string) => encryptedStorage.get(key, {
      encryptionPassword: password,
    }),
    remove: (key: string) => encryptedStorage.remove(key),
  }), [password]);
}
```

## TypeScript Support

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

function useTypedStorage<T>(key: string, defaultValue: T) {
  const storage = useStrata();
  const [value, setValue] = useState<T>(defaultValue);
  
  useEffect(() => {
    storage.get<T>(key).then(data => {
      if (data) setValue(data);
    });
  }, [key]);
  
  const updateValue = async (newValue: T) => {
    await storage.set(key, newValue);
    setValue(newValue);
  };
  
  return [value, updateValue] as const;
}

// Usage
const [user, setUser] = useTypedStorage<User>('current_user', {
  id: '',
  name: '',
  email: ''
});
```

## See Also

- [Vue Composables](./vue-composables.md)
- [Angular Services](./angular-services.md)
- [React Integration](./frameworks/react.md)