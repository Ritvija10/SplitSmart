// Splits totalPaise among userIds with no paise lost or invented.
// Example: 10000 paise among 3 people -> 3334, 3333, 3333
export const splitEqually = (totalPaise, userIds) => {
  const count = userIds.length;
  const base = Math.floor(totalPaise / count);
  const remainder = totalPaise % count;

  return userIds.map((user, index) => ({
    user,
    amount: base + (index < remainder ? 1 : 0),
  }));
};