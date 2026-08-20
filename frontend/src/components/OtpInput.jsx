import React, { useRef, useEffect } from 'react';

export const OtpInput = ({
  value = '',
  onChange,
  length = 6,
  isInvalid = false,
  disabled = false,
}) => {
  const inputRefs = useRef([]);

  // Split given string into array of characters
  const otpArray = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    // Focus the first empty box on mount if empty
    if (!value && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, e) => {
    const rawVal = e.target.value;
    const digit = rawVal.replace(/\D/g, '').slice(-1); // Only keep last numeric digit

    const newOtp = [...otpArray];
    newOtp[index] = digit;
    const combined = newOtp.join('');

    onChange(combined);

    // If digit was entered, move focus to the next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpArray[index] && index > 0) {
        // Current box is empty, clear previous box and focus it
        const newOtp = [...otpArray];
        newOtp[index - 1] = '';
        onChange(newOtp.join(''));
        inputRefs.current[index - 1]?.focus();
      } else if (otpArray[index]) {
        // Clear current box
        const newOtp = [...otpArray];
        newOtp[index] = '';
        onChange(newOtp.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    const cleanNumbers = pastedData.replace(/\D/g, '').slice(0, length);

    if (cleanNumbers.length > 0) {
      onChange(cleanNumbers);
      const focusIndex = Math.min(cleanNumbers.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="otp-boxes-wrapper" onPaste={handlePaste}>
      {Array.from({ length }, (_, index) => {
        const char = otpArray[index] || '';
        return (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={char}
            disabled={disabled}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={`otp-box-input ${char ? 'filled' : ''} ${
              isInvalid ? 'is-invalid' : ''
            }`}
            aria-label={`Digit ${index + 1} of OTP`}
          />
        );
      })}
    </div>
  );
};

export default OtpInput;
