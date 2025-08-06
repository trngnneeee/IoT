const TrashVolume = require("../model/trash.model");

const formatToMinuteString = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
};

module.exports.trashVolumePost = async (req, res) => {
  const now = new Date();
  const nowMinute = formatToMinuteString(now);

  const recentRecords = await TrashVolume.find()
    .sort({ date: -1 }) 
    .limit(10);

  const existing = recentRecords.find(item => formatToMinuteString(item.date) === nowMinute);

  if (existing) {
    await TrashVolume.findByIdAndUpdate(existing._id, {
      ...req.body,
      date: now
    });
  } else {
    if (recentRecords.length >= 10) {
      const oldest = recentRecords[recentRecords.length - 1];
      await TrashVolume.findByIdAndDelete(oldest._id);
    }

    await TrashVolume.create({
      ...req.body,
      date: now
    });
  }

  res.json({
    code: "success",
    message: "Trash volume saved successfully!"
  });
};

module.exports.trashVolumeGet = async (req, res) => {
  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

  const rawData = await TrashVolume.find({
    date: { $gte: tenMinutesAgo, $lte: now }
  });

  const data = rawData.map(item => ({
    hour: new Date(item.date).toISOString(), 
    value: item.value
  }));

  res.json({
    code: "success",
    message: "Get data successfully!",
    data: data
  });
};
