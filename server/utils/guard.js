module.exports.safeInput = (s) => {
  const cleaned = s.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
  return cleaned.slice(0, 1000);
}
