const TrashVolume = require("../model/trash.model");
const mailHelper = require("../helper/mail.helper");
const AdminAccount = require("../model/admin-account.model");

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

  if (req.body.percentage1 >= 100) {
    sendWarningEmail(1, req.body.percentage1);
  }
  if (req.body.percentage2 >= 100) {
    sendWarningEmail(2, req.body.percentage1);
  }
  if (req.body.percentage3 >= 100) {
    sendWarningEmail(3, req.body.percentage1);
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
