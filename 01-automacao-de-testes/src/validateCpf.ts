export function validateCpf(str: string) {
  if (!str) return false;

  str = str.replace(/\D/g, "");
  if (str.length !== 11 || str.split("").every((c: string) => c === str[0]))
    return false;

  const calcDigit = (cpf: string, factor: number) =>
    cpf
      .slice(0, factor - 1)
      .split("")
      .reduce((sum, c, i) => sum + parseInt(c) * (factor - i), 0);

  const mod = (n: number) => (n % 11 < 2 ? 0 : 11 - (n % 11));
  const dg1 = mod(calcDigit(str, 10));
  const dg2 = mod(calcDigit(str, 11));

  return str.slice(-2) === `${dg1}${dg2}`;
}
