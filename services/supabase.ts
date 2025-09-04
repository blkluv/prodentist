
import { createClient } from '@supabase/supabase-js';
import { Staff, Patient, Role, User } from '../types';

// --- Real Supabase Client ---
const supabaseUrl = 'https://zhgoqmizxvktqgxmzfjv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ29xbWl6eHZrdHFneG16Zmp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NTUyMzAsImV4cCI6MjA3MjEzMTIzMH0.2D7sJU3bSItotTSS6pL2S1ldahidapXJKETrw1jfRHQ';
const realSupabase = createClient(supabaseUrl, supabaseAnonKey);


// --- Mock Data (for staff and auth) ---
let MOCK_STAFF: Staff[] = [
  { id: '1', name: 'Dr. Abdelhamid', email: 'admin@goldensmile.ma', role: Role.ADMIN, created_at: new Date().toISOString(), password: 'aze123' },
  { id: '2', name: 'Hanane Rexona', email: 'staff@clinic.com', role: Role.STAFF, created_at: new Date().toISOString(), password: 'aze123' },
];

let currentUser: User | null = null;

// --- Hybrid Supabase Client (Mock + Real) ---
const createHybridSupabaseClient = () => {
  // Overloads for type inference
  function from(tableName: 'staff'): {
    select: () => Promise<Staff[]>;
    insert: (data: any) => Promise<Staff>;
    update: (id: string, data: any) => Promise<void>;
    delete: (id: string) => Promise<void>;
    count: () => Promise<number>;
  };
  function from(tableName: 'patients'): {
    select: () => Promise<Patient[]>;
    insert: (data: any) => Promise<Patient>;
    update: (id: string, data: any) => Promise<void>;
    delete: (id: string) => Promise<void>;
    count: () => Promise<number>;
  };

  function from(tableName: 'staff' | 'patients') {
    // --- MOCK implementation for 'staff' ---
    if (tableName === 'staff') {
      return {
        select: async (): Promise<Staff[]> => {
          await new Promise(res => setTimeout(res, 300));
          if (!currentUser) return [];
          return [...MOCK_STAFF];
        },
        insert: async (data: any): Promise<Staff> => {
          await new Promise(res => setTimeout(res, 300));
          if (!currentUser) throw new Error("Authentication required");
          const newItem = { ...data, id: Math.random().toString(36).substring(2), created_at: new Date().toISOString() };
          MOCK_STAFF.push(newItem as Staff);
          return newItem as Staff;
        },
        update: async (id: string, data: any): Promise<void> => {
           await new Promise(res => setTimeout(res, 300));
           if (!currentUser) throw new Error("Authentication required");
           MOCK_STAFF = MOCK_STAFF.map(item => item.id === id ? { ...item, ...data } : item);
        },
        delete: async (id: string): Promise<void> => {
          await new Promise(res => setTimeout(res, 300));
          if (!currentUser) throw new Error("Authentication required");
          MOCK_STAFF = MOCK_STAFF.filter(item => item.id !== id);
        },
        count: async (): Promise<number> => {
            return MOCK_STAFF.length;
        }
      };
    } 
    // --- REAL implementation for 'patients' ---
    else { 
      return {
        select: async (): Promise<Patient[]> => {
          console.log(`[Supabase REAL] SELECT * FROM ${tableName}`);
          const { data, error } = await realSupabase.from(tableName).select('*').order('created_at', { ascending: false });
          if (error) {
            console.error('Error fetching patients:', error);
            throw error;
          }
          return data || [];
        },
        insert: async (insertData: any): Promise<Patient> => {
          console.log(`[Supabase REAL] INSERT INTO ${tableName}`);
          const { data, error } = await realSupabase.from(tableName).insert([insertData]).select();
           if (error) {
             console.error('Error inserting patient:', error);
             throw error;
           }
           return data[0];
        },
        update: async (id: string, updateData: any): Promise<void> => {
          console.log(`[Supabase REAL] UPDATE ${tableName} SET ... WHERE id=${id}`);
          const { error } = await realSupabase.from(tableName).update(updateData).eq('id', id);
           if (error) {
             console.error('Error updating patient:', error);
             throw error;
           }
        },
        delete: async (id: string): Promise<void> => {
          console.log(`[Supabase REAL] DELETE FROM ${tableName} WHERE id=${id}`);
          const { error } = await realSupabase.from(tableName).delete().eq('id', id);
           if (error) {
             console.error('Error deleting patient:', error);
             throw error;
           }
        },
        count: async (): Promise<number> => {
            console.log(`[Supabase REAL] COUNT FROM ${tableName}`);
            const { count, error } = await realSupabase.from(tableName).select('*', { count: 'exact', head: true });
            if (error) {
                console.error('Error counting patients:', error);
                return 0;
            }
            return count ?? 0;
        }
      };
    }
  }

  // --- MOCK implementation for 'auth' ---
  const auth = {
    signInWithPassword: async (email: string, password: string): Promise<User | null> => {
      console.log(`[Supabase Mock] signInWithPassword for ${email}`);
      await new Promise(res => setTimeout(res, 500));
      const foundUser = MOCK_STAFF.find(staff => staff.email === email && staff.password === password);
      if (foundUser) {
        currentUser = { id: foundUser.id, name: foundUser.name, email: foundUser.email, role: foundUser.role };
        localStorage.setItem('supabase.mock.auth.user', JSON.stringify(currentUser));
        return currentUser;
      }
      currentUser = null;
      localStorage.removeItem('supabase.mock.auth.user');
      return null;
    },
    signOut: async () => {
      console.log('[Supabase Mock] signOut');
      await new Promise(res => setTimeout(res, 100));
      currentUser = null;
      localStorage.removeItem('supabase.mock.auth.user');
    },
    getUser: async (): Promise<User | null> => {
        console.log('[Supabase Mock] getUser');
        await new Promise(res => setTimeout(res, 100));
        
        if (currentUser) {
            return currentUser;
        }

        const sessionUser = localStorage.getItem('supabase.mock.auth.user');
        if (sessionUser) {
            try {
                currentUser = JSON.parse(sessionUser) as User;
                return currentUser;
            } catch (e) {
                console.error('Failed to parse user from localStorage', e);
                localStorage.removeItem('supabase.mock.auth.user');
                return null;
            }
        }
      return null;
    },
  };

  return { from, auth };
};

export const supabase = createHybridSupabaseClient();
