function mapBin(normText) {
  const pairs = [
    ["organic", ["huu co", "organic", "food", "thuc an", "do an"]],
    ["recyclable", ["tai che", "recyclable", "giay", "lon", "vo lon", "bia carton"]],
    ["landfill", ["chon lap", "landfill", "rac", "rac sinh hoat", "trash", "khau trang"]]
  ];
  
  for (const [id, keys] of pairs) {
    if (keys.some(k => normText.includes(k))) {
      return id;
    }
  }
  
  return null;
}

module.exports = { mapBin };