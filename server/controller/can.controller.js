const { raw } = require("express");
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
  })

  const count = await OpenCan.countDocuments();
  if (count > 10)
  {
    await OpenCan.findOneAndDelete({});
  }

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
  const rawData = await OpenCan.find({});
  const data = [];
  const seen = new Set();
  for (const item of rawData)
  {
    if (seen.has(item.pressedBy)) continue;
    seen.add(item.pressedBy);
    const userInfo = await AdminAccount.findOne({
      _id: item.pressedBy
    })
    const numPressed = await OpenCan.countDocuments({
      pressedBy: item.pressedBy
    })
    data.push({
      userId: item.pressedBy,
      name: userInfo.fullName,
      date: item.date,
      count: numPressed
    })
  }
  
  res.json({
    code: "success",
    message: "Get stats successfully!",
    data: data
  })
}