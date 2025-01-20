import { IsString, Matches, MinLength } from 'class-validator';

export function IsStrongPassword() {
  return function (object: object, propertyName: string) {
    IsString()(object, propertyName);
    MinLength(12)(object, propertyName);
    Matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      {
        message:
          'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.',
      },
    )(object, propertyName);
  };
}
