export function mapBin(normText: string): "plastic" | "organic" | "metal" | "paper" | null {
  const pairs: [string, string[]][] = [
    ["plastic", ["nhua","plastic","pet","chai"]],
    ["organic", ["huu co","organic","food","thuc an","do an"]],
    ["metal",   ["kim loai","metal","lon","vo lon","nhom","sat","thep"]],
    ["paper",   ["giay","paper","thung giay","vo hop giay"]]
  ];
  for (const [id, keys] of pairs) {
    if (keys.some(k => normText.includes(k))) return id as any;
  }
  return null;
}
