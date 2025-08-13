const mongoose = require("mongoose");
const OpenCan = require("../model/open-can.model");
const AdminAccount = require("../model/admin-account.model");

module.exports.openCan = async (req, res) => {
  if (req.query.id)
  {
    const newRecord = new OpenCan({
      id: parseInt(req.query.id),
      pressed: false,
      pressedBy: req.account._id,
      date: Date.now()
    })
    await newRecord.save();
  }
  
  res.json({
    code: "success",
    message: "Send Open-can request successfully!"
  })
}

module.exports.sendReq = async (req, res) => {
  const rawData = await OpenCan.findOne({
    pressed: false
  });

  if (rawData)
  {
    const id = rawData.id;
    res.json({
      code: "success",
      message: "Send Open-can request successfully!",
      id: id
    })
    await OpenCan.findOneAndUpdate(
      { _id: rawData._id },
      { pressed: true }
    );
  }
  else
  {
    res.json({
      code: "error",
      message: "No request found!",
      id: 0
    })
  }
}

module.exports.getStas = async (req, res) => {
  const rawData = await OpenCan.find({ pressed: true }).sort({ date: -1 });
  const data = [];
  for (const item of rawData) {
    const userInfor = await AdminAccount.findOne({ _id: item.pressedBy });
    if (!userInfor) continue;

    data.push({
      name: userInfor.fullName,
      date: item.date
    });
  }

  const countArr = [];
  const adminAccountList = await AdminAccount.find({});
  for (const item of adminAccountList) {
    const count = await OpenCan.countDocuments({ pressedBy: item._id });
    countArr.push({
      name: item.fullName,
      count: count
    });
  }

  res.json({
    code: "success",
    message: "Get Open-can status successfully!",
    data: data,
    count: countArr
  });
};
