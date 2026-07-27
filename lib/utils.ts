export function formatPhoneNumber(phone: string): string {
  let formatted = phone.replace(/\s+/g, '').trim();
  if (formatted.startsWith("0") && formatted.length === 10) {
    return `+233${formatted.substring(1)}`;
  } else if (formatted.startsWith("233") && formatted.length >= 11) {
    return `+${formatted}`;
  } else if (formatted.length === 9 && !formatted.startsWith("+")) {
    return `+233${formatted}`;
  } else if (!formatted.startsWith("+")) {
    return `+${formatted}`;
  }
  return formatted;
}
