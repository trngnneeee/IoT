function mapBin(normText) {
  const pairs = [
    ["plastic", ["nhua", "plastic", "pet", "chai"]],
    ["organic", ["huu co", "organic", "food", "thuc an", "do an"]],
    ["metal",   ["kim loai", "metal", "lon", "vo lon", "nhom", "sat", "thep"]],
    ["paper",   ["giay", "paper", "thung giay", "vo hop giay"]]
  ];
  
  for (const [id, keys] of pairs) {
    if (keys.some(k => normText.includes(k))) {
      return id;
    }
  }
  
  return null;
}

module.exports = { mapBin };