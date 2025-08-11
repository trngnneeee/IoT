const TrashVolume = require("../model/trash.model");

const formatToMinuteString = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
};

module.exports.trashVolumePost = async (req, res) => {
  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

  // Xóa các bản ghi cũ hơn 10 phút
  await TrashVolume.deleteMany({ date: { $lt: tenMinutesAgo } });

  // Đếm số bản ghi hiện tại còn lại (từ 10 phút trước tới giờ)
  const count = await TrashVolume.countDocuments({ date: { $gte: tenMinutesAgo } });

  // Nếu còn >= 10 bản ghi, xóa bản ghi cũ nhất
  if (count >= 10) {
    const oldest = await TrashVolume.findOne({ date: { $gte: tenMinutesAgo } }).sort({ date: 1 });
    if (oldest) {
      await TrashVolume.deleteOne({ _id: oldest._id });
    }
  }

  await TrashVolume.create({
    percentage1: req.body.percentage1,
    percentage2: req.body.percentage2,
    percentage3: req.body.percentage3,
    date: now
  });

  res.json({
    code: "success",
    message: "Trash percentage saved successfully!"
  });
};

module.exports.trashVolumeGet = async (req, res) => {
  const rawData = await TrashVolume.find({});
  const data = [];
  rawData.forEach((item) => {
    data.push({
      hour: new Date(item.date).toISOString(),
      percentage1: item.percentage1,
      percentage2: item.percentage2,
      percentage3: item.percentage3
    })
  })
  res.json({
    code: "success",
    message: "Get data successfully!",
    data: data
  })
};
