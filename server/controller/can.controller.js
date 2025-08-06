const OpenCan = require("../model/open-can.model");

module.exports.openCan = async (req, res) => {
  if (req.query.id)
  {
    const id = req.query.id;
    const arr = [];
    arr.push(parseInt(id));
    const newRecord = new OpenCan({
      arr: arr,
      expireAt: Date.now() + 2000
    })
    await newRecord.save();
  }
  
  res.json({
    code: "success",
    message: "Send Open-can request successfully!"
  })
}

module.exports.sendReq = async (req, res) => {
  const rawData = await OpenCan.findOneAndDelete({});

  if (rawData)
  {
    res.json({
      code: "success",
      message: "Send Open-can request successfully!"
    })
  }
  else
  {
    res.json({
      code: "error",
      message: "No request found!"
    })
  }
}