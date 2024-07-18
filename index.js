const express = require('express');
const app = express();
var fs = require('fs');
// const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const User  = require('./models/User');
const {push_notifications} = require('./middleware/push_notification')
const bodyParser = require('body-parser');


const {
    get_messages,
    send_message
} = require('./utils/messages');



app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use('/uploads', express.static('uploads'));

// app.use(express.static(path.resolve('../ravebae/admin/build/')));


// app.get('/*', function (req, res) {
//     // res.sendFile(path.resolve('../ravebae/admin/build/index.html'));
//     res.sendFile(path.resolve(__dirname, 'admin', 'build', 'index.html'));
//   });

const PORT = process.env.PORT || 3010;

dotenv.config();



// const options = {
// key: fs.readFileSync('/etc/letsencrypt/live/webservices.ravebae.org/privkey.pem'),
// cert: fs.readFileSync('/etc/letsencrypt/live/webservices.ravebae.org/cert.pem'),
// ca: fs.readFileSync('/etc/letsencrypt/live/webservices.ravebae.org/chain.pem')
// };

//  const server = require('https').createServer(options, app);
 const server = require('http').createServer(app);


var io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH", "DELETE"],
        credentials: false,
        transports: ['websocket', 'polling'],
        allowEIO3: true
    },
});

//** Datrabase Connection **//
mongoose.connect(
    process.env.DB_CONNECT,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }, () => console.log('Connection success')
);

const apiRoutes = require('./routes/api');
const Content = require('./models/Content');
app.use('/api', apiRoutes);

/** Content seeder */
const contentSeeder = [
    {
        title: "Privacy Policy",
        content: "Lorem ipsum dolor sit amet.Ea iste consectetur qui harum libero exercitationem harum et quam earum At cupiditate perferendis qui aspernatur vero!",
        type: "privacy_policy"
    },
    {
        title: "Terms and Conditions",
        content: "Lorem ipsum dolor sit amet.Ea iste consectetur qui harum libero exercitationem harum et quam earum At cupiditate perferendis qui aspernatur vero!",
        type: "terms_and_conditions"
    },
    {
        title: "Help and Support",
        content: "Lorem ipsum dolor sit amet.Ea iste consectetur qui harum libero exercitationem harum et quam earum At cupiditate perferendis qui aspernatur vero!",
        type: "help_and_support"
    }
];
const dbSeed = async () => {
    await Content.deleteMany({});
    await Content.insertMany(contentSeeder);
}
dbSeed().then(() => {
    // mongoose.connection.close();
})

// Run when client connects
io.on('connection', socket => {
    console.log("socket connection " + socket.id);
    socket.on('get_messages', function (object) {
        var user_room = "user_" + object.sender_id;
        socket.join(user_room);
        get_messages(object, function (response) {
            if (response.length > 0) {
                console.log("get_messages has been successfully executed...");
                io.to(user_room).emit('response', { object_type: "get_messages", data: response });
            } else {
                console.log("get_messages has been failed...");
                io.to(user_room).emit('error', { object_type: "get_messages", message: "There is some problem in get_messages..." });
            }
        });
    });
    // SEND MESSAGE EMIT
    socket.on('send_message', async function (object) {

        //         // notification start //
                const receiver_object = await User.find({
                    _id: object.receiver_id
                });

                const sender_object = await User.find({
                    _id: object.sender_id,
                });

                 console.log("sender_object:", sender_object);

                let receiver_device_token = "";
                let receiver_name = "";
                let is_notification_reciever = " ";
                for (let i = 0; i < receiver_object.length; i++) {
                    receiver_device_token = receiver_object[i].user_device_token;
                    receiver_name = receiver_object[i].username;
                    is_notification_reciever = receiver_object[i].is_notification;
                }


                let sender_device_token = "";
                let sender_name = "";
                let sender_image = "";
                // let sender_id = "";
                for (let i = 0; i < sender_object.length; i++) {
                    sender_device_token = sender_object[i].user_device_token;
                    sender_name = sender_object[i].username;
                    sender_image = sender_object[i].user_image;
                    // sender_id = sender_object[i]._id;
                }

                // console.log("sender_name:", sender_name);

                const notification_obj_receiver = {
                    user_device_token: receiver_device_token,
                    title: receiver_name,
                    body: `${sender_name} has send you a message.`,
                    notification_type:'msg_notify',
                    vibrate:1,
                    sound:1,
                    sender_id:object.sender_id,
                    sender_name:sender_name,
                    sender_image:sender_image,
                };
        // console.log("notification_obj_receiver:", notification_obj_receiver);
        // is_notification_reciever == "true"
                    //  console.log("reciever_notificatrion:", is_notification_reciever);
                if (is_notification_reciever == 1) {
                     push_notifications(notification_obj_receiver);
                }

                // notification end //

        var sender_room = "user_" + object.sender_id;
        var receiver_room = "user_" + object.receiver_id;
        send_message(object, function (response_obj) {
            if (response_obj) {
                console.log("send_message has been successfully executed...");
                io.to(sender_room).to(receiver_room).emit('response', { object_type: "get_message", data: response_obj });
            } else {
                console.log("send_message has been failed...");
                io.to(sender_room).to(receiver_room).emit('error', { object_type: "get_message", message: "There is some problem in get_message..." });
            }
        });
    });
});


server.listen(PORT, () => console.log('Server running on', PORT));

// const express = require('express');
// const app = express();
// var fs = require('fs');
// const dotenv = require('dotenv');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bodyParser = require('body-parser');


// const {
//     get_messages,
//     send_message
// } = require('./utils/messages');


// app.use(cors());
// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json());

// app.use('/uploads', express.static('uploads'));

// const PORT = process.env.PORT || 3010;

// dotenv.config();

// const options = {
//     key: fs.readFileSync('/home/serverappsstagin/ssl/keys/c2a88_d6811_bbf1ed8bd69b57e3fcff0d319a045afc.key'),
//     cert: fs.readFileSync('/home/serverappsstagin/ssl/certs/server_appsstaging_com_c2a88_d6811_1665532799_3003642ca1474f02c7d597d2e7a0cf9b.crt'),
// };

// const server = require('https').createServer(options, app);
//  //const server = require('http').createServer(app);


// var io = require('socket.io')(server, {
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST", "PATCH", "DELETE"],
//         credentials: false,
//         transports: ['websocket', 'polling'],
//         allowEIO3: true
//     },
// });

// //** Datrabase Connection **//
// mongoose.connect(
//     process.env.DB_CONNECT,
//     {
//         useUnifiedTopology: true,
//         useNewUrlParser: true
//     }, () => console.log('Connection success')
// );

// const apiRoutes = require('./routes/api');
// const Content = require('./models/Content');
// app.use('/api', apiRoutes);

// /** Content seeder */
// const contentSeeder = [
//     {
//         title: "Privacy Policy",
//         content: "Lorem ipsum dolor sit amet.Ea iste consectetur qui harum libero exercitationem harum et quam earum At cupiditate perferendis qui aspernatur vero!",
//         type: "privacy_policy"
//     },
//     {
//         title: "Terms and Conditions",
//         content: "Lorem ipsum dolor sit amet.Ea iste consectetur qui harum libero exercitationem harum et quam earum At cupiditate perferendis qui aspernatur vero!",
//         type: "terms_and_conditions"
//     }
// ];
// const dbSeed = async () => {
//     await Content.deleteMany({});
//     await Content.insertMany(contentSeeder);
// }
// dbSeed().then(() => {
//     // mongoose.connection.close();
// })

// // Run when client connects
// io.on('connection', socket => {
//     console.log("socket connection " + socket.id);
//     socket.on('get_messages', function (object) {
//         var user_room = "user_" + object.sender_id;
//         socket.join(user_room);
//         get_messages(object, function (response) {
//             if (response.length > 0) {
//                 console.log("get_messages has been successfully executed...");
//                 io.to(user_room).emit('response', { object_type: "get_messages", data: response });
//             } else {
//                 console.log("get_messages has been failed...");
//                 io.to(user_room).emit('error', { object_type: "get_messages", message: "There is some problem in get_messages..." });
//             }
//         });
//     });
//     // SEND MESSAGE EMIT
//     socket.on('send_message', function (object) {
//         var sender_room = "user_" + object.sender_id;
//         var receiver_room = "user_" + object.receiver_id;
//         send_message(object, function (response_obj) {
//             if (response_obj) {
//                 console.log("send_message has been successfully executed...");
//                 io.to(sender_room).to(receiver_room).emit('response', { object_type: "get_message", data: response_obj });
//             } else {
//                 console.log("send_message has been failed...");
//                 io.to(sender_room).to(receiver_room).emit('error', { object_type: "get_message", message: "There is some problem in get_message..." });
//             }
//         });
//     });
// });


// server.listen(PORT, () => console.log('Server running on', PORT));
