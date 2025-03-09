import {
  IsString,
  MinLength,
  Matches,
  ValidationOptions,
} from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    IsString()(object, propertyName);
    MinLength(12, {
      message: 'Password must be at least 12 characters long.',
      ...validationOptions,
    })(object, propertyName);
    Matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+~`|}{[\]\\:;?><,./-=])[A-Za-z\d!@#$%^&*()_+~`|}{[\]\\:;?><,./-=]+$/,
      {
        message:
          'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.',
        ...validationOptions,
      },
    )(object, propertyName);
  };
}
