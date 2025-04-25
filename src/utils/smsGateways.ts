// SMS Gateway mappings for email-to-SMS functionality
export const carrierGateways: Record<string, string> = {
  'AT&T': 'txt.att.net',
  'Verizon': 'vtext.com',
  'T-Mobile': 'tmomail.net',
  'Sprint': 'messaging.sprintpcs.com',
  'Google Voice': 'txt.voice.google.com',
  'Boost Mobile': 'sms.myboostmobile.com',
  'Cricket': 'sms.cricketwireless.net',
  'Metro PCS': 'mymetropcs.com',
  'U.S. Cellular': 'email.uscc.net',
  'Virgin Mobile': 'vmobl.com'
};

// List of carriers for dropdown selection
export const carriers = Object.keys(carrierGateways);

// Format phone number to remove non-numeric characters
export const formatPhoneNumber = (phoneNumber: string): string => {
  return phoneNumber.replace(/\D/g, '');
};

// Validate US phone number (10 digits)
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const cleanedNumber = formatPhoneNumber(phoneNumber);
  return cleanedNumber.length === 10;
};

// Construct SMS gateway email from phone number and carrier
export const constructSmsEmail = (
  phoneNumber: string, 
  carrier: string
): string | null => {
  if (!phoneNumber || !carrier) return null;
  
  const cleanedNumber = formatPhoneNumber(phoneNumber);
  const gateway = carrierGateways[carrier];
  
  if (!gateway || !isValidPhoneNumber(cleanedNumber)) {
    return null;
  }
  
  return `${cleanedNumber}@${gateway}`;
}; 