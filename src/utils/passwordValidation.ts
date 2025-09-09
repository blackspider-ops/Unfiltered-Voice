export interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

export const passwordRequirements: Omit<PasswordRequirement, 'met'>[] = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (password: string) => password.length >= 8
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter (A-Z)',
    test: (password: string) => /[A-Z]/.test(password)
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter (a-z)',
    test: (password: string) => /[a-z]/.test(password)
  },
  {
    id: 'number',
    label: 'One number (0-9)',
    test: (password: string) => /\d/.test(password)
  },
  {
    id: 'special',
    label: 'One special character (!@#$%^&*)',
    test: (password: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  }
];

export const validatePassword = (password: string): PasswordRequirement[] => {
  return passwordRequirements.map(req => ({
    ...req,
    met: req.test(password)
  }));
};

export const isPasswordStrong = (password: string): boolean => {
  return passwordRequirements.every(req => req.test(password));
};

export const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  const metRequirements = passwordRequirements.filter(req => req.test(password)).length;
  
  if (metRequirements === 0) {
    return { score: 0, label: 'Very Weak', color: 'text-red-500' };
  } else if (metRequirements <= 2) {
    return { score: 25, label: 'Weak', color: 'text-red-400' };
  } else if (metRequirements <= 3) {
    return { score: 50, label: 'Fair', color: 'text-yellow-500' };
  } else if (metRequirements <= 4) {
    return { score: 75, label: 'Good', color: 'text-blue-500' };
  } else {
    return { score: 100, label: 'Strong', color: 'text-green-500' };
  }
};