export const randomPassword = (length = 24) => {
  let result = '';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+~`|}{[]\\:;?><,./-=';
  const allCharacters = uppercase + lowercase + numbers + specialChars;

  // Đảm bảo mật khẩu có ít nhất một ký tự từ mỗi loại
  result += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  result += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  result += numbers.charAt(Math.floor(Math.random() * numbers.length));
  result += specialChars.charAt(
    Math.floor(Math.random() * specialChars.length),
  );

  // Điền thêm các ký tự ngẫu nhiên cho đến khi đạt độ dài yêu cầu
  const remainingLength = length - 4; // Trừ đi 4 ký tự đã thêm ở trên
  for (let i = 0; i < remainingLength; i++) {
    result += allCharacters.charAt(
      Math.floor(Math.random() * allCharacters.length),
    );
  }

  // Trộn ngẫu nhiên các ký tự trong mật khẩu để đảm bảo tính ngẫu nhiên
  result = result
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');

  return result;
};

export const generateRandomCode = (length = 24) => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const allCharacters = uppercase + lowercase + numbers;

  let result = '';
  for (let i = 0; i < length; i++) {
    result += allCharacters.charAt(
      Math.floor(Math.random() * allCharacters.length),
    );
  }

  return result;
};
