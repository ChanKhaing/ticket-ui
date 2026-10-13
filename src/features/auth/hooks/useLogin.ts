import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import type { LoginInput, LoginResult } from '../types';
import type { NormalizedError } from '@/types';

export function useLogin() {
  return useMutation<LoginResult, NormalizedError, LoginInput>({
    mutationFn: (input) => authService.login(input),
  });
}