import { Check, X } from 'lucide-react';
import { validatePassword, getPasswordStrength, type PasswordRequirement } from '@/utils/passwordValidation';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export function PasswordStrengthIndicator({ password, showRequirements = true }: PasswordStrengthIndicatorProps) {
  const requirements = validatePassword(password);
  const strength = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Password Strength</span>
          <span className={`text-sm font-medium ${strength.color}`}>
            {strength.label}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              strength.score <= 25 ? 'bg-red-500' :
              strength.score <= 50 ? 'bg-yellow-500' :
              strength.score <= 75 ? 'bg-blue-500' :
              'bg-green-500'
            }`}
            style={{ width: `${strength.score}%` }}
          />
        </div>
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Password must have:</p>
          <div className="space-y-1">
            {requirements.map((req) => (
              <div key={req.id} className="flex items-center gap-2 text-sm">
                {req.met ? (
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className={req.met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}