var FCM = require("fcm-node");
var serverKey =
  "AAAAMoqFZJY:APA91bG_Y9934IwODAHntHLxwJvwMMWifDyhwUSuh-ks2aTCHA7mO5PaSgRn2tnX54Vw3eBzXgNdFrGgaI3jr7VF24LN2FOuOUeY-SepqA0O7TuielnhGy4oraHvdsPDUWfRnyeEn1sP"; //put your server key here
var fcm = new FCM(serverKey);

const push_notifications = (notification_obj) => {
  var message = {
    to: notification_obj.user_device_token,
    collapse_key: "your_collapse_key",

    notification: {
    sender_id:notification_obj.sender_id,
     sender_name:notification_obj.sender_name,
     sender_image:notification_obj.sender_image,
      title: notification_obj.title,
      body: notification_obj.body,
      notification_type:notification_obj.notification_type,
      vibrate:notification_obj.vibrate,
      sound:notification_obj.sound
    //   type: notification_obj.type
    },

     data: {  //you can send only notification or only data(or include both)
    //   sender_object: notification_obj.sender_objects,
    //   receiver_object: notification_obj.receiver_objects,
       sender_id:notification_obj.sender_id,
       sender_name:notification_obj.sender_name,
       sender_image:notification_obj.sender_image,
       notification_type:notification_obj.notification_type,
       vibrate:notification_obj.vibrate,
       sound:notification_obj.sound
    //   sender_object: JSON.parse(notification_obj.sender_objects),
    //   receiver_object: JSON.parse(notification_obj.receiver_objects)

    }



  };
  console.log("message:", message);
  fcm.send(message, function (err, response) {
    if (err) {
      console.log("Something has gone wrong!");
    } else {
      console.log("Successfully sent with response: ", response);
    }
  });
};

module.exports = { push_notifications };

