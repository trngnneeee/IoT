const TrashVolume = require("../model/trash.model");
const mailHelper = require("../helper/mail.helper");
const AdminAccount = require("../model/admin-account.model");
const TrashWeight = require("../model/trash-weight.model");

const sendWarningEmail = async (id, p) => {
  const adminAccount = await AdminAccount.find({});
  const emailList = adminAccount.map((item) => item.email);

  const subject = `Cảnh báo: Thùng rác đã đầy`;

  const content = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #fff8e1;">
  <h2 style="color: #d9534f;">⚠ Cảnh báo thùng rác đầy</h2>
  <p>Xin chào,</p>
  <p>Hệ thống phát hiện <strong>thùng rác ${id}</strong> đã đầy và cần được xử lý ngay.</p>
  <div style="text-align: center; margin: 20px 0;">
    <span style="font-size: 18px; font-weight: bold; color: #a94442; background-color: #f2dede; padding: 10px 20px; border-radius: 5px;">
      Mức đầy: ${p}%
    </span>
  </div>
  <p><strong>Hành động khuyến nghị:</strong> Vui lòng dọn thùng rác để tránh tràn hoặc gây mùi khó chịu.</p>
  <p>Nếu bạn đã xử lý, vui lòng bỏ qua email này.</p>
  <hr style="margin: 30px 0;">
  <p style="font-size: 12px; color: #888;">Email này được gửi tự động từ hệ thống giám sát, vui lòng không trả lời lại.</p>
</div>
`;
  for (const email of emailList)
  {
    mailHelper.sendMail(email, subject, content);
  }
}

module.exports.trashVolumePost = async (req, res) => {
  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

  // Đếm số bản ghi trong 10 phút gần nhất
  const count = await TrashVolume.countDocuments({ date: { $gte: tenMinutesAgo } });

  // Nếu đã đủ 10 bản ghi thì xóa bản ghi cũ nhất để chừa chỗ cho bản ghi mới
  if (count >= 10) {
    const oldest = await TrashVolume.findOne({ date: { $gte: tenMinutesAgo } }).sort({ date: 1 });
    if (oldest) {
      await TrashVolume.deleteOne({ _id: oldest._id });
    }
  }

  if (req.body.percentage1 >= 100) {
    sendWarningEmail(1, req.body.percentage1);
  }
  if (req.body.percentage2 >= 100) {
    sendWarningEmail(2, req.body.percentage2);
  }
  if (req.body.percentage3 >= 100) {
    sendWarningEmail(3, req.body.percentage3);
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
  const rawTrashVolume = await TrashVolume.find({});
  const trashVolume = [];
  rawTrashVolume.forEach((item) => {
    trashVolume.push({
      hour: new Date(item.date).toISOString(),
      percentage1: item.percentage1,
      percentage2: item.percentage2,
      percentage3: item.percentage3
    })
  })
  const rawTrashWeight = await TrashWeight.findOne({});
  res.json({
    code: "success",
    message: "Get data successfully!",
    trashVolume: trashVolume,
    trashWeight: rawTrashWeight
  })
};

module.exports.trashWeightPost = async (req, res) => {
  const newRecord = new TrashWeight(req.body);
  const existRecord = await TrashWeight.findOne({});
  if (existRecord)
  {
    existRecord.w1 = req.body.w1;
    existRecord.w2 = req.body.w2;
    existRecord.w3 = req.body.w3;
    await existRecord.save();
  }
  else
  {
    await newRecord.save();
  }
  res.json({
    code: "success",
    message: "Trash weight saved successfully!"
  });
}