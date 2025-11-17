// src/hooks/useUserRole.ts (versión robusta)
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export type UserRole = 'admin' | 'employee' | 'partner'

export function useUserRole() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['user-role'],
    queryFn: async () => {
      try {
        // 1. Primero obtener usuario de auth
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          console.log('No user found in auth')
          return null
        }

        // 2. Intentar obtener datos extendidos
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role, full_name, is_active')
          .eq('id', user.id)
          .maybeSingle() // Usar maybeSingle en lugar de single

        // 3. Si no existe el usuario en la tabla, crearlo
        if (userError?.code === 'PGRST116' || !userData) {
          console.log('User not found in users table, creating...')
          
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.email?.split('@')[0] || 'Usuario',
              role: 'employee',
              is_active: true
            })
            .select()
            .single()

          if (createError) {
            console.error('Error creating user record:', createError)
            // Fallback: retornar usuario básico
            return {
              ...user,
              role: 'employee' as UserRole,
              full_name: user.email?.split('@')[0],
              is_active: true
            }
          }

          return {
            ...user,
            role: newUser.role,
            full_name: newUser.full_name,
            is_active: newUser.is_active
          }
        }

        if (userError) {
          console.error('Error fetching user data:', userError)
          // Fallback en caso de error
          return {
            ...user,
            role: 'employee' as UserRole,
            full_name: user.email?.split('@')[0],
            is_active: true
          }
        }

        const validRole: UserRole = 
          userData.role === 'admin' || userData.role === 'employee' || userData.role === 'partner'
          ? userData.role
          : 'employee'

        return {
          ...user,
          role: validRole,
          full_name: userData.full_name,
          is_active: userData.is_active
        }

      } catch (error) {
        console.error('Unexpected error in useUserRole:', error)
        return null
      }
    },
    retry: 2,
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}