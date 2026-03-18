export function getBankLogoUrl(bankCode) {
  if (!bankCode) return ''
  // Local public asset path: `code/frontend/public/banks/<bank>.svg`
  // In this repo, filenames are lowercase (e.g. `ktb.svg`, `scb.svg`, `kbank.svg`).
  const code = String(bankCode).trim().toLowerCase()
  return `/banks/${encodeURIComponent(code)}.svg`
}

