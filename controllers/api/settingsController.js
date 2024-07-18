const User = require('../../models/User');

const Notifications = async (req, res) => {
    try {
           if (!req.body.is_notification) {
        res.status(400).json({
            status: 0,
            message: "Select On/Off notification",
        })
    }
      if (req.body.is_notification == "off") {
  
  
        let user = await User.findOneAndUpdate(
          { _id: req.user._id},
          {
            is_notification: 0
          },
          { new: true }
        );
  
  
        res
          .status(200)
          .send({ status: 1, message: "Notification Off"});
  
      } else if (req.body.is_notification == "on" ) {
        let user = await User.findOneAndUpdate(
          { _id: req.user._id },
          {
            is_notification: 1
          },
          { new: true }
        );
        res
          .status(200)
          .send({ status: 1, message: "Notification ON"});
      }
    } catch (e) {
      res.status(400).send({ status: 0, message: "Failed Notification toggle!" });
    }
  };

  module.exports = {
    Notifications
}